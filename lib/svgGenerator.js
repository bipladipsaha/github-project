/**
 * SVG Generator Module
 * 
 * Downloads base SVGs from the template source and applies
 * user-specific text replacements. Modular design allows
 * swapping template sources or adding new templates later.
 */

// The base SVG template source (Sharann-del's profile)
const BASE_URL = 'https://raw.githubusercontent.com/Sharann-del/Sharann-del/main/assets/';

// SVG files that make up the profile
const SVG_FILES = [
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
  const regex = new RegExp(`<g class="row r${numProjects + 1}"[\\s\\S]*?(?=</g>\\s*</svg>)`);
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
 * Generate all SVG files for both light and dark modes.
 * Returns a Map<filename, content> including 'dark/' prefixed entries.
 */
export async function generateSVGs(formData) {
  const replacements = buildReplacements(formData);
  const accentLight = formData.accentLight || '#0284c7';
  const accentDark = formData.accentDark || '#38bdf8';
  
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

  for (const filename of SVG_FILES) {
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

  return { results, errors };
}

/**
 * Get the list of SVG files that this generator produces.
 * Useful for README template to know which assets to reference.
 */
export function getSVGFileList() {
  return SVG_FILES;
}
