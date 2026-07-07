'use client';

import { useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════════

const BG = { r: 11, g: 16, b: 32 };
const DPR_CLAMP = 2;

// Fluid Surface Physics
const PARTICLE_COUNT = 1000;
const PUDDLE_SPREAD = 7; // Distance between dots in the fluid surface
const DAMPING = 0.75; // Increased friction for thicker, softer fluid viscosity

// Idle Breathing (Extremely soft and slow now)
const NOISE_SCALE = 0.0015; // Larger waves so they drift together
const NOISE_SPEED = 0.00004; // Extremely slow breathing
const NOISE_AMPLITUDE = 0.15; // Very subtle force to prevent 'storm' effect

// Background Grid
const DRAW_GRID = true;
const GRID_SPACING = 100;
const GRID_COLOR = 'rgba(255, 255, 255, 0.03)';
const GRID_COLOR_BRIGHT = 'rgba(255, 255, 255, 0.06)';

// ═══════════════════════════════════════════════════════════════════
// SIMPLEX NOISE
// ═══════════════════════════════════════════════════════════════════

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];

class SimplexNoise2D {
  constructor(seed = 42) {
    const perm = this.perm = new Uint8Array(512);
    const mod12 = this.mod12 = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = (seed * 2147483647) | 0;
    if (s <= 0) s = 1;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
      mod12[i] = perm[i] % 12;
    }
  }

  noise(x, y) {
    const { perm, mod12 } = this;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = mod12[ii + perm[jj]];
    const gi1 = mod12[ii + i1 + perm[jj + j1]];
    const gi2 = mod12[ii + 1 + perm[jj + 1]];
    let n0, n1, n2;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0;
    else { t0 *= t0; n0 = t0 * t0 * (GRAD[gi0][0] * x0 + GRAD[gi0][1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0;
    else { t1 *= t1; n1 = t1 * t1 * (GRAD[gi1][0] * x1 + GRAD[gi1][1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0;
    else { t2 *= t2; n2 = t2 * t2 * (GRAD[gi2][0] * x2 + GRAD[gi2][1] * y2); }
    return 70 * (n0 + n1 + n2);
  }
}

function curlNoise(simplex, x, y, t) {
  const eps = 0.1;
  const sx = x * NOISE_SCALE;
  const sy = y * NOISE_SCALE;
  const st = t * NOISE_SPEED;
  const dndy = simplex.noise(sx, sy + eps + st) - simplex.noise(sx, sy - eps + st);
  const dndx = simplex.noise(sx + eps, sy + st) - simplex.noise(sx - eps, sy + st);
  return {
    x: (dndy / (2 * eps)) * NOISE_AMPLITUDE,
    y: (-dndx / (2 * eps)) * NOISE_AMPLITUDE
  };
}

// ═══════════════════════════════════════════════════════════════════
// PARTICLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    let w, h, dpr;
    let animId = 0;
    let prevTs = 0;
    let elapsed = 0;
    let resizeTimer;
    const noise = new SimplexNoise2D();

    const count = PARTICLE_COUNT;
    const posX = new Float32Array(count);
    const posY = new Float32Array(count);
    const velX = new Float32Array(count);
    const velY = new Float32Array(count);
    
    // Fixed offsets relative to the cursor to form the fluid surface
    const offsetX = new Float32Array(count);
    const offsetY = new Float32Array(count);
    const springK = new Float32Array(count); // Center particles follow tightly, edge particles lag
    
    const baseSize = new Float32Array(count);
    const pAlpha = new Float32Array(count);
    const pFlavor = new Float32Array(count); // 0.0 to 1.0 for color mixing

    const mouse = {
      x: -1000, y: -1000,
      active: false,
    };

    function setupCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CLAMP);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      if (!mouse.active) {
        mouse.x = w / 2;
        mouse.y = h / 2;
      }
    }

    function initParticles() {
      // Golden spiral (Sunflower seed) distribution for perfectly even circular puddle
      const maxR = PUDDLE_SPREAD * Math.sqrt(count);
      
      for (let i = 0; i < count; i++) {
        const r = PUDDLE_SPREAD * Math.sqrt(i);
        const theta = i * 137.508 * (Math.PI / 180);
        
        offsetX[i] = r * Math.cos(theta);
        offsetY[i] = r * Math.sin(theta);
        
        posX[i] = w/2 + offsetX[i];
        posY[i] = h/2 + offsetY[i];
        velX[i] = 0;
        velY[i] = 0;
        
        // Center particles have higher spring constant (follow faster) creating a fluid jelly effect
        const normalizedDist = r / maxR;
        springK[i] = 0.08 - (normalizedDist * 0.07); // Ranges from 0.08 (center) to 0.01 (edge)
        
        // Edge particles are slightly larger and fainter to simulate fluid depth
        baseSize[i] = 1.0 + (1.0 - normalizedDist) * 1.5;
        pAlpha[i] = 0.2 + (1.0 - normalizedDist) * 0.6; // Edge: 0.2, Center: 0.8
        
        pFlavor[i] = Math.random();
      }
    }

    function update(dt) {
      const dtFactor = Math.min(dt / 16.667, 2.5);
      const now = elapsed;

      // If mouse is inactive, gently drift towards center
      if (!mouse.active) {
        mouse.x += ((w/2) - mouse.x) * 0.01 * dtFactor;
        mouse.y += ((h/2) - mouse.y) * 0.01 * dtFactor;
      }

      for (let i = 0; i < count; i++) {
        // Target is cursor position + particle's unique formation offset
        const targetX = mouse.x + offsetX[i];
        const targetY = mouse.y + offsetY[i];

        // Spring force towards target
        let ax = (targetX - posX[i]) * springK[i];
        let ay = (targetY - posY[i]) * springK[i];

        // Add subtle fluid turbulence (Curl noise)
        const curl = curlNoise(noise, posX[i], posY[i], now);
        ax += curl.x;
        ay += curl.y;

        // Apply friction / viscosity
        velX[i] = (velX[i] + ax * dtFactor) * DAMPING;
        velY[i] = (velY[i] + ay * dtFactor) * DAMPING;
        
        posX[i] += velX[i] * dtFactor;
        posY[i] += velY[i] * dtFactor;
      }
    }

    function drawGrid() {
      ctx.lineWidth = 1;
      const offsetX = (w / 2) % GRID_SPACING;
      const offsetY = (h / 2) % GRID_SPACING;
      
      for (let x = offsetX; x < w; x += GRID_SPACING) {
        const colIdx = Math.round((x - (w / 2)) / GRID_SPACING);
        ctx.strokeStyle = (colIdx % 5 === 0) ? GRID_COLOR_BRIGHT : GRID_COLOR;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      
      for (let y = offsetY; y < h; y += GRID_SPACING) {
        const rowIdx = Math.round((y - (h / 2)) / GRID_SPACING);
        ctx.strokeStyle = (rowIdx % 5 === 0) ? GRID_COLOR_BRIGHT : GRID_COLOR;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }

    function render() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgb(${BG.r}, ${BG.g}, ${BG.b})`;
      ctx.fillRect(0, 0, w, h);

      // Vignette
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (DRAW_GRID) drawGrid();

      ctx.globalCompositeOperation = 'lighter';
      
      for (let i = 0; i < count; i++) {
        const x = posX[i];
        const y = posY[i];
        
        // Dynamic Color Interpolation based on Screen X position
        // 0 = Far Left (Orange), 1 = Far Right (Blue)
        const ratio = Math.max(0, Math.min(1, x / w));
        const blend = ratio * ratio * (3 - 2 * ratio); // Smoothstep
        
        const flavor = pFlavor[i];
        
        // Left colors (Soft Orange to Yellowish Orange)
        const lr = 232, lg = 157 + flavor * 42, lb = 120 + flavor * 22; 
        
        // Right colors (Soft Blue to Soft Violet)
        const rr = 134 + flavor * 28, rg = 166 - flavor * 21, rb = 232;
        
        const r = Math.round(lr + (rr - lr) * blend);
        const g = Math.round(lg + (rg - lg) * blend);
        const b = Math.round(lb + (rb - lb) * blend);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pAlpha[i]})`;
        ctx.beginPath();
        ctx.arc(x, y, baseSize[i], 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
    }

    function loop(timestamp) {
      const dt = Math.min(timestamp - prevTs, 50);
      prevTs = timestamp;
      elapsed += dt;

      update(dt);
      render();
      animId = requestAnimationFrame(loop);
    }

    function onMouseMove(e) {
      mouse.x = e.clientX; 
      mouse.y = e.clientY;
      mouse.active = true;
    }
    function onMouseLeave() { 
      mouse.active = false; 
    }
    function onTouchMove(e) {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX; 
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    }
    function onTouchEnd() { mouse.active = false; }
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupCanvas(); 
        initParticles();
      }, 400);
    }

    setupCanvas(); 
    initParticles();
    prevTs = performance.now();
    animId = requestAnimationFrame(loop);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId); clearTimeout(resizeTimer);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-field"
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
