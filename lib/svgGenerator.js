/**
 * SVG Generator Module
 * 
 * Downloads base SVGs from the template source and applies
 * user-specific text replacements. Modular design allows
 * swapping template sources or adding new templates later.
 * 
 * Only generates SVGs for sections the user has filled in.
 */

import { computeFilledSections, getVisibleSVGFiles } from './sectionVisibility';

// The base SVG template source (Sharann-del's profile)
const BASE_URL = 'https://raw.githubusercontent.com/Sharann-del/Sharann-del/main/assets/';

// All possible SVG files that make up the profile
const ALL_SVG_FILES = [
  'header-v1.svg',
  's01.svg',
  'whoami.svg',
  's03.svg',
  's04.svg',
  'telemetry.svg',
  'github-stats.svg',
  's06.svg',
  'stack.svg',
  'footer.svg',
  'projects.svg',
];

/**
 * Download a file from a URL and return its text content.
 */
async function downloadFile(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }
  return res.text();
}

/**
 * Build the replacement map from user form data.
 * Maps original Sharann template strings → user's custom strings.
 */
export function buildReplacements(formData) {
  const {
    fullName = 'Your Name',
    githubUsername = 'username',
    tagline = 'Developer',
    location = 'Earth',
    university = '',
    club = '',
    bio = '',
    buildDesc = '',
    philosophy = '',
    focusAreas = '',
    availability = 'open to internships · freelance · collaboration',
    stackRow1 = '',
    stackRow2 = '',
    stackRow3 = '',
    stackRow4 = '',
    stackRow5 = '',
    platformsLabel = '',
    websiteDomain = '',
    projects = [],
  } = formData;

  const replacements = {};

  // ── Header SVG ──
  replacements['Sharann Manojkumar'] = fullName;
  replacements['iOS &amp; Full-Stack Developer — Chennai, India.'] = tagline;
  replacements['iOS · full-stack systems · terminal interfaces · AI-integrated products'] =
    focusAreas || 'Backend · Embedded Systems · Machine Learning · IoT';

  // Focus area tags in header
  const areas = (focusAreas || '').split('·').map(s => s.trim()).filter(Boolean);
  replacements['IOS &amp; SWIFTUI'] = areas[0] ? areas[0].toUpperCase() : 'SKILL 1';
  replacements['FULL-STACK SYSTEMS'] = areas[1] ? areas[1].toUpperCase() : 'SKILL 2';
  replacements['TERMINAL INTERFACES'] = areas[2] ? areas[2].toUpperCase() : 'SKILL 3';

  replacements['VIT — 2024 / 2028'] = university || 'My University';
  replacements['CHENNAI, IN — 13.08° N'] = location;

  // ── Whoami SVG ──
  replacements['third-year CS student at Vellore Institute of Technology, Chennai.'] =
    bio || `Developer based in ${location}.`;
  replacements['building across the full stack — SwiftUI · React · PostgreSQL · Node.js · CLI tooling.'] =
    buildDesc || `building great software.`;
  replacements['drawn to projects where design meets data. clean architecture and user experience in equal measure.'] =
    philosophy || 'drawn to building impactful software.';
  replacements['iOS &amp; Mobile · Full-Stack Systems · Terminal UI / CLI · AI-integrated architectures'] =
    focusAreas || 'Software Development';
  replacements['open to internships · freelance · collaboration'] =
    availability;
  replacements['iSpace Club — Web &amp; App Development department'] =
    club || 'Open Source Contributor';

  // ── Stack SVG ──
  replacements['Swift, SwiftUI, UIKit, Combine, CoreData, WidgetKit'] =
    stackRow1 || 'Your languages here';
  replacements['TypeScript, React.js, Next.js, Node.js, Express, TailwindCSS'] =
    stackRow2 || 'Your frameworks here';
  replacements['PostgreSQL, MongoDB, Redis, Prisma, Supabase, Firebase'] =
    stackRow3 || 'Your platforms here';
  replacements['Git, Docker, Linux, Bash, Vercel, AWS (EC2, S3), Cloudflare'] =
    stackRow4 || 'Your tools here';
  replacements['Figma, Adobe CC, DaVinci Resolve, Logic Pro X, Notion'] =
    stackRow5 || 'Your workflows here';

  // ── Projects SVG ──
  const origProjects = [
    {
      nameKey: '01 / API KEYCHAIN',
      desc1Key: 'Unified LLM gateway across eight inference networks, with encrypted credential storage and one consistent provider interface.',
      desc2Key: 'Tracks requests and usage analytics while protecting API keys with AES-256-GCM encryption.',
      techKey: 'NEXT.JS · TYPESCRIPT · FASTAPI · PYTHON · SUPABASE · SECURITY',
    },
    {
      nameKey: '02 / PROPOSALOS',
      desc1Key: 'AI-assisted RFP discovery and response platform built at Ambian Strategy from the initial architecture onward.',
      desc2Key: 'Collects opportunities from 11+ procurement portals, scores business fit, and reduces response work from days to hours.',
      techKey: 'NEXT.JS · FASTAPI · PYTHON · SUPABASE · SCRAPING · AI FIT-SCORING',
    },
    {
      nameKey: '03 / KERN',
      desc1Key: 'Keyboard-driven personal data OS with schema-flexible JSONB storage and connected views for information and workflows.',
      desc2Key: 'Integrates GitHub, Notion, calendars, Linear and RSS, then exposes personal data through an MCP server.',
      techKey: 'REACT · TYPESCRIPT · POSTGRESQL · SUPABASE · JSONB · MCP',
    },
  ];

  for (let i = 0; i < origProjects.length && i < projects.length; i++) {
    const orig = origProjects[i];
    const user = projects[i];
    if (user.name) {
      replacements[orig.nameKey] = `${String(i + 1).padStart(2, '0')} / ${user.name.toUpperCase()}`;
    }
    if (user.desc1) replacements[orig.desc1Key] = user.desc1;
    if (user.desc2) replacements[orig.desc2Key] = user.desc2;
    if (user.techStack) replacements[orig.techKey] = user.techStack.toUpperCase();
  }

  // ── Telemetry ──
  replacements['PLATFORMS — IOS / WEB / CLI'] =
    platformsLabel ? `PLATFORMS — ${platformsLabel.toUpperCase()}` : 'PLATFORMS — BACKEND / ML / IOT';

  // ── Footer / Global ──
  replacements['sharann.dev'] = websiteDomain || `github.com/${githubUsername}`;
  replacements['Chennai, IN'] = location.split('—')[0]?.trim() || location;
  
  // Section numbering (match your profile's numbering)
  replacements['03 — projects'] = '02 — projects';
  replacements['<text class="mono" x="48" y="68" font-size="52" fill="var(--ghost)">03</text>'] = '<text class="mono" x="48" y="68" font-size="52" fill="var(--ghost)">02</text>';
  replacements['~/03-projects'] = '~/02-projects';
  replacements['06 — stack'] = '03 — stack';
  replacements['<text class="mono" x="48" y="68" font-size="52" fill="var(--ghost)">06</text>'] = '<text class="mono" x="48" y="68" font-size="52" fill="var(--ghost)">03</text>';
  replacements['~/06-stack'] = '~/03-stack';

  return replacements;
}

/**
 * Trim projects.svg to dynamically match the number of valid projects,
 * preventing massive empty gaps at the bottom.
 */
export function trimProjectsSvg(content, numProjects) {
  if (numProjects >= 15) return content; // max template size
  
  // Calculate dynamic viewBox height. Each row is 104px height, with ~130px padding at the bottom.
  const dynamicHeight = (numProjects * 104) + 130;
  
  // Replace the viewBox
  let result = content.replace(/viewBox="0 0 1000 1690"/, `viewBox="0 0 1000 ${dynamicHeight}"`);
  
  // Remove all <g class="row rX"> where X > numProjects
  const regex = new RegExp(`<g class="row r${numProjects + 1}"[\\s\\S]*?(?=<\/g>\\s*<\/svg>)`);
  result = result.replace(regex, '');
  
  return result;
}

/**
 * Apply all text replacements to SVG content.
 */
function applyReplacements(svgContent, replacements) {
  let result = svgContent;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }
  return result;
}

/**
 * Clean up corrupted CSS variables from the original templates.
 * The original templates from Sharann-del have hardcoded :root {...} blocks 
 * injected at the very end of the <style> block which overrides the dark/light mode 
 * colors and makes the text invisible.
 */
export function cleanupCorruptedCSS(svgContent) {
  return svgContent.replace(/(?:\s*:root\s*{[^}]*}\s*)+(?=<\/style>)/g, '\n');
}

/**
 * Generate a generic section divider SVG
 */
function generateSectionDividerSvg(sectionNum, title, isDark, accent) {
  const bg = isDark ? '#0c0e14' : '#ffffff';
  const bone = isDark ? '#dddddd' : '#444444';
  const rule = isDark ? '#444444' : '#c0c0c0';
  const muted = isDark ? '#777777' : '#888888';
  const ghost = isDark ? '#2a2a2a' : '#cccccc';

  return `<svg viewBox="0 0 1000 92" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Section ${sectionNum} - ${title}">
  <style>
    :root { --rule: ${rule}; --muted: ${muted}; --accent: ${accent}; --ghost: ${ghost}; }
    .mono { font-family: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    .draw { stroke: var(--rule); stroke-width: 1; stroke-dasharray: 760; stroke-dashoffset: 760; animation: d 1.3s cubic-bezier(.6,0,.2,1) .2s forwards; }
    @keyframes d { to { stroke-dashoffset: 0; } }
    .f { opacity: 0; animation: f .8s ease .1s forwards; }
    @keyframes f { to { opacity: 1; } }
    .tick { animation: p 2.4s ease-in-out infinite; }
    @keyframes p { 0%,100%{opacity:1} 50%{opacity:1} }
    @media (prefers-reduced-motion: reduce) {
      .draw,.f,.tick { animation: none; } .draw { stroke-dashoffset: 0; } .f { opacity: 1; }
    }
  </style>
  <g class="f">
    <text class="mono" x="48" y="68" font-size="52" fill="var(--ghost)">${sectionNum}</text>
    <text class="mono tick" x="128" y="58" font-size="14" fill="var(--accent)" letter-spacing="6">${title.toUpperCase()}</text>
    <text class="mono" x="952" y="58" font-size="11" fill="var(--muted)" letter-spacing="2" text-anchor="end">~/${sectionNum}-${title.toLowerCase().replace(/\\s+/g, '-')}</text>
  </g>
  <line class="draw" x1="300" y1="53" x2="831" y2="53"/>
</svg>`;
}

/**
 * Generate a generic custom content SVG
 * Extremely simple wrapping: roughly 85 characters per line
 */
function generateCustomContentSvg(text, isDark, accent) {
  const bone = isDark ? '#dddddd' : '#444444';
  const muted = isDark ? '#777777' : '#888888';

  // Basic word wrap
  const maxChars = 85;
  const words = (text || '').split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  // Height based on lines
  const height = Math.max(100, lines.length * 28 + 64);

  let svgLines = '';
  lines.forEach((line, index) => {
    const y = 32 + (index * 28);
    const delay = 0.1 + (index * 0.1);
    svgLines += `  <text class="mono rise" style="animation-delay:${delay}s" x="48" y="${y}" font-size="16" fill="${bone}">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n`;
  });

  return `<svg viewBox="0 0 1000 ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Custom Section">
  <style>
    .mono { font-family: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    .rise { opacity: 0; animation: rise .7s cubic-bezier(.2,.7,.2,1) forwards; }
    @keyframes rise { from { opacity:0;transform:translateY(8px); } to { opacity:1;transform:translateY(0); } }
    @media (prefers-reduced-motion: reduce) { .rise { animation: none; opacity: 1; transform: translateY(0); } }
  </style>
${svgLines}
</svg>`;
}

/**
 * Generate all SVG files for both light and dark modes.
 * Only generates SVGs for sections the user has filled in.
 * Returns a Map<filename, content> including 'dark/' prefixed entries.
 */
export async function generateSVGs(formData) {
  const replacements = buildReplacements(formData);
  const accentLight = formData.accentLight || '#0284c7';
  const accentDark = formData.accentDark || '#38bdf8';
  
  // Determine which SVGs to generate based on filled sections
  const sections = computeFilledSections(formData);
  const svgFiles = getVisibleSVGFiles(sections);
  
  const templateStyle = formData.template || 'default';
  let currentBaseUrl = BASE_URL;
  if (templateStyle === 'minimal') {
    // Placeholder for when you provide the minimal template URL
    // currentBaseUrl = 'https://raw.githubusercontent.com/user/minimal-template/main/assets/';
  } else if (templateStyle === 'compact') {
    // Placeholder for when you provide the compact template URL
    // currentBaseUrl = 'https://raw.githubusercontent.com/user/compact-template/main/assets/';
  }

  const results = new Map();
  const errors = [];

  for (const filename of svgFiles) {
    if (filename.startsWith('custom-')) {
      // It's a custom SVG. filename is e.g. "custom-1-divider.svg" or "custom-1-content.svg"
      for (const isDark of [false, true]) {
        const destKey = isDark ? `dark/${filename}` : filename;
        const accent = isDark ? accentDark : accentLight;

        const parts = filename.split('-'); // ["custom", "1", "divider.svg"]
        const customId = `custom-${parts[1]}`;
        const type = parts[2].split('.')[0]; // "divider" or "content"
        const customData = (formData.customSections || []).find(s => s.id === customId);
        
        if (!customData) continue;

        // Figure out the section number based on orderedVisibleSections
        const sectionNumStr = String(sections.orderedVisibleSections.indexOf(customId) + 1).padStart(2, '0');

        try {
          let content = '';
          if (type === 'divider') {
            content = generateSectionDividerSvg(sectionNumStr, customData.title, isDark, accent);
          } else if (type === 'content') {
            content = generateCustomContentSvg(customData.content, isDark, accent);
          }
          results.set(destKey, content);
        } catch (err) {
          errors.push(`${destKey}: ${err.message}`);
          console.error(`Error processing custom ${destKey}:`, err.message);
        }
      }
    } else {
      // Standard SVG
      for (const isDark of [false, true]) {
        const url = `${currentBaseUrl}${isDark ? 'dark/' : ''}${filename}`;
        const destKey = isDark ? `dark/${filename}` : filename;

        try {
          let content = await downloadFile(url);
          content = cleanupCorruptedCSS(content);
          content = applyReplacements(content, replacements);

          // Apply accent color
          const accent = isDark ? accentDark : accentLight;
          content = content.replace(/--accent:\s*#[A-Fa-f0-9]{6}/g, `--accent:${accent}`);

          // Trim projects.svg dynamically based on exact number of populated projects
          if (filename === 'projects.svg') {
            const numProjects = (formData.projects || []).filter(p => p.name && p.name.trim() !== '').length || 1;
            content = trimProjectsSvg(content, numProjects);
          }

          results.set(destKey, content);
        } catch (err) {
          errors.push(`${destKey}: ${err.message}`);
          console.error(`Error processing ${destKey}:`, err.message);
        }
      }
    }
  }

  return { results, errors };
}

/**
 * Get the list of SVG files that this generator produces.
 * If formData is provided, returns only the files for filled sections.
 * Otherwise returns all possible SVG files.
 */
export function getSVGFileList(formData) {
  if (formData) {
    const sections = computeFilledSections(formData);
    return getVisibleSVGFiles(sections);
  }
  return ALL_SVG_FILES;
}
