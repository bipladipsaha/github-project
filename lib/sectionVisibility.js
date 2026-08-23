/**
 * Section Visibility Helper
 * 
 * Determines which profile sections should be rendered based on
 * which form fields the user has actually filled in.
 */

const DEFAULT_VALUES = {
  fullName: 'John Doe',
  githubUsername: 'johndoe',
  tagline: 'Full Stack Engineer',
  location: 'San Francisco, CA',
  university: 'Tech University',
  club: 'Open Source Club',
  bio: 'Building the future of web.',
  buildDesc: 'React, Node, and Rust.',
  philosophy: 'Clean code, clear mind.',
  focusAreas: 'Frontend · Backend · Systems',
  availability: 'open to opportunities',
  stackRow1: 'JavaScript, TypeScript, Rust',
  stackRow2: 'React, Next.js, Tailwind',
  stackRow3: 'Node.js, Postgres',
  stackRow4: 'Git, Docker, AWS',
  stackRow5: 'Figma, Notion',
  platformsLabel: 'Web / Cloud',
  portfolioUrl: 'https://johndoe.com',
  linkedinUsername: 'johndoe',
  email: 'john@doe.com',
  twitterUsername: 'johndoe',
  websiteDomain: 'johndoe.com',
  resumeUrl: '',
};

/**
 * Check if a field was meaningfully filled (not empty).
 */
function isFilled(value, defaultValue) {
  if (!value || (typeof value === 'string' && !value.trim())) return false;
  return true;
}

/**
 * Compute which sections should be visible based on filled form fields.
 * Returns an object with visibility booleans and the ordered list of sections.
 */
export function computeFilledSections(formData) {
  const visibility = {
    // Header is always shown if name or username exists
    header: isFilled(formData.fullName, DEFAULT_VALUES.fullName) ||
            isFilled(formData.githubUsername, DEFAULT_VALUES.githubUsername),

    // About section: bio, buildDesc, or philosophy
    about: isFilled(formData.bio, DEFAULT_VALUES.bio) ||
           isFilled(formData.buildDesc, DEFAULT_VALUES.buildDesc) ||
           isFilled(formData.philosophy, DEFAULT_VALUES.philosophy) ||
           isFilled(formData.club, DEFAULT_VALUES.club) ||
           isFilled(formData.focusAreas, DEFAULT_VALUES.focusAreas) ||
           isFilled(formData.availability, DEFAULT_VALUES.availability),

    // Projects section: at least one project with a name
    projects: Array.isArray(formData.projects) &&
              formData.projects.some(p => p && p.name && p.name.trim() !== ''),

    // Stack section: any stack row is filled
    stack: isFilled(formData.stackRow1, DEFAULT_VALUES.stackRow1) ||
           isFilled(formData.stackRow2, DEFAULT_VALUES.stackRow2) ||
           isFilled(formData.stackRow3, DEFAULT_VALUES.stackRow3) ||
           isFilled(formData.stackRow4, DEFAULT_VALUES.stackRow4) ||
           isFilled(formData.stackRow5, DEFAULT_VALUES.stackRow5),

    // Telemetry: needs github username
    telemetry: isFilled(formData.githubUsername, DEFAULT_VALUES.githubUsername),

    // Footer is always shown
    footer: true,

    // Badges: individual badge visibility
    badges: isFilled(formData.portfolioUrl, DEFAULT_VALUES.portfolioUrl) ||
            isFilled(formData.linkedinUsername, DEFAULT_VALUES.linkedinUsername) ||
            isFilled(formData.email, DEFAULT_VALUES.email) ||
            isFilled(formData.twitterUsername, DEFAULT_VALUES.twitterUsername) ||
            isFilled(formData.resumeUrl, DEFAULT_VALUES.resumeUrl),
  };

  const hiddenSet = new Set(formData.hiddenSections || []);
  
  // Custom sections are always visible unless explicitly hidden
  const customSectionIds = (formData.customSections || []).map(s => s.id);
  for (const id of customSectionIds) {
    visibility[id] = true;
  }

  // Filter sectionsOrder to only include visible and non-hidden sections
  const sectionsOrder = formData.sectionsOrder || ['basic', 'about', 'career', 'projects', 'stack', 'links'];
  const orderedVisibleSections = sectionsOrder.filter(id => {
    if (hiddenSet.has(id)) return false;
    
    // Core sections map to visibility booleans, but wait, the section IDs in sectionsOrder
    // are 'basic', 'about', 'career', 'projects', 'stack', 'links'.
    // Let's map them to the visibility keys
    if (id === 'basic') return visibility.header || visibility.badges;
    if (id === 'about') return visibility.about;
    if (id === 'career') return false; // career doesn't have an SVG right now
    if (id === 'projects') return visibility.projects;
    if (id === 'stack') return visibility.stack;
    if (id === 'links') return visibility.telemetry; // links/telemetry map to the same
    
    // Custom sections
    if (id.startsWith('custom-')) return visibility[id];

    return true;
  });

  return { ...visibility, orderedVisibleSections };
}

/**
 * Get list of SVG files that should be generated based on section visibility.
 */
export function getVisibleSVGFiles(sections, formData) {
  const files = [];

  if (sections.header) files.push('header-v1.svg');
  if (sections.about) {
    files.push('s01.svg', 'whoami.svg');
  }
  if (sections.projects) {
    files.push('s03.svg', 'projects.svg');
  }
  if (sections.stack) {
    files.push('s06.svg', 'stack.svg');
  }
  if (sections.telemetry) {
    files.push('s04.svg', 'telemetry.svg', 'github-stats.svg');
  }
  if (sections.footer) files.push('footer.svg');

  // Custom sections
  if (formData && formData.customSections) {
    formData.customSections.forEach(custom => {
      files.push(`${custom.id}-divider.svg`);
      files.push(`${custom.id}-content.svg`);
    });
  }

  return files;
}

