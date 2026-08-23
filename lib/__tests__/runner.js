const NextResponse = {};

/**
 * POST /api/parse-resume
 * 
 * Accepts a multipart/form-data upload containing a PDF or DOCX resume.
 * Extracts text, segments it into sections, parses each section semantically,
 * validates the results, and returns structured form fields.
 */
async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file uploaded. Please select a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = '';

    // ── Extract text based on file type ──
    if (filename.endsWith('.pdf')) {
      const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
      const parseFunc = pdfParseModule.default || pdfParseModule;
      const pdfData = await parseFunc(buffer);
      rawText = pdfData.text;
    } else if (filename.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the file. The file may be image-based or corrupted.' },
        { status: 422 }
      );
    }

    // ── New pipeline: segment → extract → validate → map ──
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const sections = segmentSections(lines);
    const structured = extractStructured(sections, rawText);
    const validated = validateAndNormalize(structured);
    const formFields = mapToFormSchema(validated);

    return NextResponse.json({
      success: true,
      extracted: formFields,
      rawTextPreview: rawText.substring(0, 500),
    });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse the resume. Please try a different file or fill the form manually.' },
      { status: 500 }
    );
  }
}


// ═══════════════════════════════════════════════════════════════════
// STAGE 1: SECTION SEGMENTATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Known section heading patterns mapped to canonical section names.
 * Order matters: more specific patterns first.
 */
const SECTION_PATTERNS = [
  { name: 'summary',     regex: /^(?:summary|profile|about\s*(?:me)?|objective|introduction|career\s*(?:summary|objective))\s*$/i },
  { name: 'experience',  regex: /^(?:experience|work\s*experience|professional\s*experience|employment|internship|work\s*history|internships?)\s*$/i },
  { name: 'education',   regex: /^(?:education|academic\s*(?:background|qualifications?)|qualifications?|educational\s*background)\s*$/i },
  { name: 'projects',    regex: /^(?:projects?|personal\s*projects?|key\s*projects?|featured\s*projects?|notable\s*projects?|academic\s*projects?|side\s*projects?)\s*$/i },
  { name: 'skills',      regex: /^(?:skills?|technical\s*skills?|technologies|tech\s*stack|core\s*competenc|competenc|tools?\s*(?:&|and)\s*technologies|areas?\s*of\s*expertise)\s*$/i },
  { name: 'achievements', regex: /^(?:achievements?|awards?|honors?|certifications?|accomplishments?|extracurricular|activities|publications?|leadership)\s*$/i },
  { name: 'interests',   regex: /^(?:interests?|hobbies|languages?|extra[\s-]*curricular)\s*$/i },
  { name: 'references',  regex: /^(?:references?)\s*$/i },
];

/**
 * Detect whether a line is a section heading.
 * Returns the canonical section name or null.
 */
function detectSectionHeading(line) {
  const cleaned = line.replace(/[:\-–—_#*|]/g, '').trim();
  if (cleaned.length < 2 || cleaned.length > 50) return null;

  for (const { name, regex } of SECTION_PATTERNS) {
    if (regex.test(cleaned)) return name;
  }

  // Heuristic: ALL-CAPS short lines that match known patterns
  if (/^[A-Z\s&/]{3,40}$/.test(cleaned) && cleaned.length < 40) {
    const lower = cleaned.toLowerCase().trim();
    for (const { name, regex } of SECTION_PATTERNS) {
      if (regex.test(lower)) return name;
    }
  }

  return null;
}

/**
 * Segment resume lines into sections.
 * Returns a Map<sectionName, string[]> where 'header' is everything
 * before the first recognized section heading.
 */
function segmentSections(lines) {
  const sections = new Map();
  let currentSection = 'header';
  sections.set('header', []);

  for (const line of lines) {
    const sectionName = detectSectionHeading(line);
    if (sectionName) {
      currentSection = sectionName;
      if (!sections.has(currentSection)) {
        sections.set(currentSection, []);
      }
      // Don't add the heading line itself to content
      continue;
    }
    if (!sections.has(currentSection)) {
      sections.set(currentSection, []);
    }
    sections.get(currentSection).push(line);
  }

  return sections;
}


// ═══════════════════════════════════════════════════════════════════
// STAGE 2: STRUCTURED EXTRACTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract structured data from segmented sections.
 * Each field is extracted only from its semantically correct section.
 */
function extractStructured(sections, fullText) {
  const headerLines = sections.get('header') || [];
  const eduLines = sections.get('education') || [];
  const projLines = sections.get('projects') || [];
  const skillLines = sections.get('skills') || [];
  const summaryLines = sections.get('summary') || [];
  const expLines = sections.get('experience') || [];

  return {
    // ── Basic info: from header + full text for URLs ──
    fullName: extractNameFromHeader(headerLines),
    githubUsername: extractGithubUsername(fullText),
    email: extractEmail(fullText),
    linkedinUsername: extractLinkedin(fullText),
    twitterUsername: extractTwitter(fullText),
    portfolioUrl: extractPortfolio(fullText),
    location: extractLocationFromHeader(headerLines),
    tagline: extractTaglineFromHeader(headerLines),

    // ── Education: only from education section ──
    university: extractUniversity(eduLines),

    // ── Summary: only from summary/profile section ──
    bio: summaryLines.length > 0 ? summaryLines.join(' ').trim() : '',

    // ── Skills: only from skills section (fallback: full text) ──
    skills: extractSkillsFromSection(skillLines, fullText),

    // ── Projects: from projects section, fallback to experience ──
    projects: extractProjectsFromSection(projLines.length > 0 ? projLines : expLines),

    // ── Experience orgs: track separately so they don't leak into university ──
    experienceOrgs: extractExperienceOrgs(expLines),
  };
}

// ── Name ──
function extractNameFromHeader(headerLines) {
  const skipWords = new Set([
    'resume', 'cv', 'curriculum', 'vitae', 'contact', 'summary',
    'education', 'experience', 'skills', 'projects', 'references',
    'address', 'phone', 'email', 'linkedin', 'github', 'portfolio',
  ]);

  for (const line of headerLines.slice(0, 8)) {
    const cleaned = line.replace(/[|•·,]/g, '').trim();
    // Skip URLs, emails, phone numbers
    if (/[@:/]/.test(cleaned)) continue;
    if (/\d{5,}/.test(cleaned)) continue; // phone numbers
    if (/^https?:/.test(cleaned)) continue;

    const words = cleaned.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && !skipWords.has(cleaned.toLowerCase())) {
      // Must be primarily alphabetic
      if (/^[A-Za-z\s.''\-]+$/.test(cleaned) && cleaned.length > 3 && cleaned.length < 50) {
        return cleaned;
      }
    }
  }
  return null;
}

// ── GitHub ──
function extractGithubUsername(text) {
  const match = text.match(/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?)/i);
  return match ? match[1] : null;
}

// ── Email ──
function extractEmail(text) {
  const match = text.match(/[\w.+\-]+@[\w\-]+\.[\w.\-]+/);
  return match ? match[0] : null;
}

// ── LinkedIn ──
function extractLinkedin(text) {
  const match = text.match(/linkedin\.com\/in\/([\w\-]+)/i);
  return match ? match[1] : null;
}

// ── Twitter ──
function extractTwitter(text) {
  const match = text.match(/(?:twitter|x)\.com\/([\w\-]+)/i);
  return match ? match[1] : null;
}

// ── Portfolio ──
function extractPortfolio(text) {
  const matches = text.match(/https?:\/\/(?!(?:github|linkedin|twitter|x)\.com)[^\s,)]+/gi);
  if (matches && matches.length > 0) {
    return matches[0].replace(/[.,;)]+$/, '');
  }
  return null;
}

// ── Location: ONLY from header lines ──
function extractLocationFromHeader(headerLines) {
  const headerText = headerLines.join('\n');

  // 1. Explicit label: "Location: Kolkata, WB"
  const labelMatch = headerText.match(/(?:address|location|based\s+in)\s*[:\-–]\s*([^\n]{2,50})/i);
  if (labelMatch) {
    const candidate = labelMatch[1].trim();
    if (looksLikeLocation(candidate)) return candidate;
  }

  // 2. Scan for "City, State" or "City, Country" patterns anywhere in the header
  // Match "KOLKATA, WEST BENGAL" or "Kolkata, India" or "San Francisco, CA"
  const cityStateMatches = headerText.matchAll(/([A-Z][A-Za-z \t]+,\s*[A-Z][A-Za-z \t]+)/g);
  for (const match of cityStateMatches) {
    const candidate = match[1].trim();
    if (looksLikeLocation(candidate) && candidate.length < 50) {
      return candidate;
    }
  }

  // 3. Scan for standalone cities/states on short lines
  for (const line of headerLines) {
    if (line.length < 30 && looksLikeLocation(line.trim())) {
      return line.trim();
    }
  }

  return null;
}

// ── Tagline: from header, must look like a role ──
function extractTaglineFromHeader(headerLines) {
  const rolePatterns = [
    /(?:full[\s\-]?stack|front[\s\-]?end|back[\s\-]?end|software|web|mobile|data|ml|ai|devops|cloud|embedded|iot|machine\s*learning)\s*(?:developer|engineer|architect|scientist|analyst|designer)/i,
    /\b(?:developer|engineer|designer|analyst|scientist|architect|consultant|intern|researcher|student)\b/i,
    /\bB\.?\s*Tech\b.*(?:student|CSE|CS|ECE|EE|IT|AI|ML)/i,
  ];

  for (const line of headerLines) {
    if (line.length > 80) continue;  // Skip long paragraphs
    if (/[@:/]/.test(line)) continue; // Skip URLs/emails
    if (/\d{5,}/.test(line)) continue; // Skip phone numbers

    for (const pattern of rolePatterns) {
      if (pattern.test(line)) {
        // Return just the matched portion if the line is long
        const match = line.match(pattern);
        if (match && line.length < 60) return line.trim();
        if (match) return match[0].trim();
      }
    }
  }
  return null;
}

// ── University: ONLY from education section lines ──
function extractUniversity(eduLines) {
  // Priority 1: Lines containing institution keywords
  for (const line of eduLines) {
    if (line.length > 120) continue;
    if (/(?:university|institute|college|school)\s+(?:of|for)\s+/i.test(line)) {
      return cleanEducationLine(line);
    }
    if (/\b(?:IIT|NIT|IIIT|IEM|VIT|BITS|SRM|MIT|IISC|AIIMS)\b/.test(line)) {
      return cleanEducationLine(line);
    }
    if (/\b(?:university|institute|college|school|academy|polytechnic)\b/i.test(line)) {
      return cleanEducationLine(line);
    }
  }

  // Priority 2: Lines with degree names (B.Tech, etc.) — return as education info
  for (const line of eduLines) {
    if (line.length > 120) continue;
    if (/\b(?:b\.?\s*tech|b\.?\s*e\b|b\.?\s*sc|m\.?\s*tech|m\.?\s*e\b|m\.?\s*sc|bca|mca|phd|bachelor|master|diploma)/i.test(line)) {
      return cleanEducationLine(line);
    }
  }

  return null;
}

function cleanEducationLine(line) {
  // Remove bullet points, numbering, trailing dates
  return line
    .replace(/^[•\-–▪■*\d.]+\s*/, '')
    .replace(/\s*[\(\[]?\d{4}\s*[-–]\s*(?:\d{4}|present|ongoing)[\)\]]?\s*$/i, '')
    .trim()
    .substring(0, 100);
}

// ── Experience Orgs: track them so they don't leak into university ──
function extractExperienceOrgs(expLines) {
  const orgs = [];
  for (const line of expLines) {
    if (line.length > 100) continue;
    // Lines that look like org names (short, capitalized, no bullets)
    if (/^[A-Z]/.test(line) && !line.startsWith('•') && !line.startsWith('-') && line.length < 60) {
      orgs.push(line.trim());
    }
  }
  return orgs;
}

// ── Skills from section ──
function extractSkillsFromSection(skillLines, fullText) {
  const text = skillLines.length > 0 ? skillLines.join(' ') : fullText;
  return categorizeSkills(text);
}

function categorizeSkills(text) {
  const categories = {
    languages: [],
    frameworks: [],
    platforms: [],
    tools: [],
    concepts: [],
  };

  const definitions = {
    languages: [
      'python', 'java(?!script)', 'javascript', 'typescript', 'c\\+\\+', 'c#',
      'ruby', 'golang', 'go(?=\\s|,|$)', 'rust', 'swift', 'kotlin', 'php',
      'scala', 'dart', 'lua', 'perl', 'html', 'css', 'sql', 'bash',
      'shell', 'matlab', 'r(?=\\s|,|$)',
    ],
    frameworks: [
      'react(?!\\.)', 'next\\.?js', 'angular', 'vue(?:\\.?js)?', 'svelte',
      'express(?:\\.?js)?', 'fastapi', 'django', 'flask', 'spring(?:\\s*boot)?',
      'node\\.?js', 'tailwind(?:\\s*css)?', 'bootstrap', 'jquery', 'laravel',
      'rails', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase',
      'supabase', 'prisma', 'graphql', 'rest\\s*api', 'sqlite',
      'tensorflow', 'pytorch', 'keras', 'scikit[\\-\\s]?learn', 'pandas', 'numpy',
      'opencv', 'streamlit',
    ],
    platforms: [
      'aws', 'azure', 'gcp', 'google\\s*cloud', 'heroku', 'vercel', 'netlify',
      'digitalocean', 'arduino', 'raspberry\\s*pi', 'esp32', 'esp8266',
      'linux', 'ubuntu', 'android', 'ios', 'windows\\s*server',
    ],
    tools: [
      'git(?!hub)', 'github', 'gitlab', 'docker', 'kubernetes', 'jenkins',
      'ci/cd', 'jira', 'confluence', 'vs\\s*code', 'vscode', 'postman',
      'figma', 'webpack', 'vite', 'npm', 'yarn', 'pip', 'maven', 'gradle',
      'jupyter', 'colab', 'power\\s*bi', 'tableau',
    ],
    concepts: [
      'machine\\s*learning', 'deep\\s*learning', 'artificial\\s*intelligence',
      'data\\s*science', 'data\\s*structures', 'algorithms', 'oop',
      'agile', 'scrum', 'devops', 'microservices', 'api\\s*design',
      'system\\s*design', 'cloud\\s*computing', 'iot',
      'internet\\s*of\\s*things', 'blockchain', 'cybersecurity',
      'nlp', 'natural\\s*language\\s*processing', 'computer\\s*vision', 'dsa',
      'object\\s*detection', 'image\\s*processing',
    ],
  };

  for (const [category, keywords] of Object.entries(definitions)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      const match = text.match(regex);
      if (match && !categories[category].some(a => a.toLowerCase() === match[0].toLowerCase())) {
        categories[category].push(match[0]);
      }
    }
  }

  return {
    languages: categories.languages.join(', '),
    frameworks: categories.frameworks.join(', '),
    platforms: categories.platforms.join(', '),
    tools: categories.tools.join(', '),
    concepts: categories.concepts.join(', '),
  };
}

// ── Projects from section ──
function extractProjectsFromSection(sectionLines) {
  const projects = [];
  let currentProject = null;

  for (const line of sectionLines) {
    // Stop at a different major section if somehow included
    if (/^(?:education|skills|technical\s*skills|certif|achiev|reference|interest|hobbies)/i.test(line)) break;

    // Detect tech stack lines
    const techStackMatch = line.match(/^(?:tech(?:nology|nologies|[\s\-]*stack)?|built\s*with|tools?\s*used|stack)\s*[:\-–]\s*(.+)/i);
    if (techStackMatch && currentProject) {
      currentProject.techStack = techStackMatch[1].trim().substring(0, 80);
      continue;
    }

    // Detect bullet points → description
    const isBullet = /^[•\-–▪■*]\s/.test(line);

    // Detect title lines: short, starts with uppercase/number, not a bullet
    const isTitleLine = (
      !isBullet &&
      line.length < 80 &&
      line.length > 2 &&
      /[A-Z]/.test(line[0]) &&
      // Not just a date or number
      !/^\d{4}\s*[-–]/.test(line) &&
      // Not a CGPA/GPA line
      !/cgpa|gpa|percentage|marks/i.test(line)
    );

    if (isTitleLine && !isBullet) {
      // Save previous project
      if (currentProject && currentProject.name) {
        projects.push(currentProject);
      }
      if (projects.length >= 5) break;

      // Parse the title line
      let name = line;
      let tech = '';

      // Extract tech in parentheses: "Project Name (React, Node)"
      const parenMatch = line.match(/\(([^)]+)\)\s*$/);
      if (parenMatch) {
        tech = parenMatch[1];
        name = line.replace(/\s*\([^)]+\)\s*$/, '').trim();
      }

      // Handle "Project Name – Tech Stack" or "Project Name | Tech"
      const separatorParts = name.split(/\s*[–|]\s*/);
      if (separatorParts.length > 1) {
        name = separatorParts[0].trim();
        if (!tech) tech = separatorParts.slice(1).join(', ');
      }

      // Also handle "Project Name - dates" (don't put dates in tech)
      const dashParts = name.split(/\s*-\s*/);
      if (dashParts.length > 1) {
        const lastPart = dashParts[dashParts.length - 1];
        if (/\d{4}/.test(lastPart) || /present|ongoing/i.test(lastPart)) {
          name = dashParts.slice(0, -1).join(' - ').trim();
        } else if (!tech) {
          name = dashParts[0].trim();
          tech = dashParts.slice(1).join(', ');
        }
      }

      currentProject = {
        name: name.replace(/^\d+\.\s*/, '').substring(0, 50),
        desc1: '',
        desc2: '',
        techStack: tech.substring(0, 80),
      };
    } else if (currentProject && (isBullet || (line.length > 20 && line.length < 200))) {
      const desc = line.replace(/^[•\-–▪■*]\s*/, '').trim();
      if (!desc) continue;

      // Check if this line looks like a tech stack list (mostly comma-separated tech names)
      if (!currentProject.techStack && looksLikeTechList(desc)) {
        currentProject.techStack = desc.substring(0, 80);
      } else if (!currentProject.desc1) {
        currentProject.desc1 = desc.substring(0, 120);
      } else if (!currentProject.desc2) {
        currentProject.desc2 = desc.substring(0, 120);
      }
    }
  }

  // Push last project
  if (currentProject && currentProject.name && projects.length < 5) {
    projects.push(currentProject);
  }

  return projects;
}

/**
 * Check if a string looks like a comma-separated list of technologies
 * rather than a sentence description.
 */
function looksLikeTechList(str) {
  const parts = str.split(/[,;|·•]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  // Most parts should be short (tech name-length) and not full sentences
  const shortParts = parts.filter(p => p.split(/\s+/).length <= 3 && p.length < 30);
  return shortParts.length / parts.length >= 0.7;
}


// ═══════════════════════════════════════════════════════════════════
// STAGE 3: SEMANTIC VALIDATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Technology and hardware terms that should NEVER appear in location.
 * This is a general blocklist, not hardcoded to specific resume values.
 */
const TECH_TERMS = new Set([
  // Hardware / IoT
  'accelerometer', 'gyroscope', 'gsm', 'gps', 'sensor', 'module',
  'arduino', 'raspberry', 'esp32', 'esp8266', 'servo', 'motor',
  'resistor', 'capacitor', 'transistor', 'diode', 'led', 'lcd',
  'oled', 'buzzer', 'relay', 'actuator', 'microcontroller',
  'breadboard', 'pcb', 'soldering', 'uart', 'spi', 'i2c',
  // Programming / Frameworks
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
  'tensorflow', 'pytorch', 'keras', 'opencv', 'pandas', 'numpy',
  'firebase', 'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite',
  'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
  'python', 'java', 'javascript', 'typescript', 'rust', 'swift',
  'kotlin', 'php', 'ruby', 'scala', 'dart', 'lua', 'perl',
  'html', 'css', 'sql', 'bash', 'matlab', 'api', 'sdk',
  'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify',
  // Generic tech terms
  'algorithm', 'framework', 'library', 'database', 'server',
  'frontend', 'backend', 'fullstack', 'devops', 'pipeline',
  'deployment', 'ci/cd', 'testing', 'debugging', 'encryption',
  'authentication', 'authorization', 'webhook', 'endpoint',
  'machine', 'learning', 'neural', 'network', 'model', 'training',
]);

/**
 * Known geographic entities (Indian states + common countries/US states)
 * for positive location validation.
 */
const GEO_TERMS = new Set([
  // Indian states
  'west bengal', 'maharashtra', 'karnataka', 'tamil nadu', 'kerala',
  'telangana', 'andhra pradesh', 'uttar pradesh', 'rajasthan', 'gujarat',
  'madhya pradesh', 'bihar', 'odisha', 'jharkhand', 'chhattisgarh',
  'assam', 'punjab', 'haryana', 'himachal pradesh', 'uttarakhand',
  'goa', 'tripura', 'meghalaya', 'manipur', 'mizoram', 'nagaland',
  'arunachal pradesh', 'sikkim', 'delhi', 'new delhi',
  // Indian cities
  'kolkata', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'hyderabad',
  'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
  'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna', 'vadodara',
  'ghaziabad', 'ludhiana', 'agra', 'nashik', 'noida', 'gurgaon',
  'gurugram', 'chandigarh', 'coimbatore', 'kochi', 'trivandrum',
  'dehradun', 'ranchi', 'bhubaneswar', 'raipur',
  // Countries
  'india', 'usa', 'united states', 'uk', 'united kingdom', 'canada',
  'australia', 'germany', 'france', 'japan', 'singapore', 'dubai',
  'uae', 'united arab emirates',
  // US states
  'california', 'new york', 'texas', 'florida', 'washington',
  'massachusetts', 'illinois', 'pennsylvania', 'georgia', 'ohio',
  'virginia', 'north carolina', 'new jersey', 'colorado', 'oregon',
  // US abbreviations
  'ca', 'ny', 'tx', 'fl', 'wa', 'ma', 'il', 'pa', 'ga', 'oh',
  'va', 'nc', 'nj', 'co', 'or', 'ct', 'md', 'mn', 'wi', 'az',
  'wb',
]);

/**
 * Check if a string looks like a geographic location.
 */
function looksLikeLocation(str) {
  if (!str || str.length < 2 || str.length > 60) return false;

  const lower = str.toLowerCase();

  // Reject if it contains tech terms
  const words = lower.split(/[\s,;]+/);
  for (const word of words) {
    if (TECH_TERMS.has(word)) return false;
  }

  // Reject if it looks like a full sentence (too many words)
  if (words.length > 6) return false;

  // Accept if any part matches a known geographic term as a whole word
  for (const geo of GEO_TERMS) {
    if (new RegExp(`\\b${geo}\\b`, 'i').test(lower)) return true;
  }

  // Accept "City, State" or "City, Country" pattern if parts are short words
  if (/^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(str) && words.length <= 5) {
    // Both parts should be title-case or UPPERCASE and short
    const parts = str.split(',').map(p => p.trim());
    if (parts.every(p => p.length >= 2 && p.length < 30)) return true;
  }

  return false;
}

/**
 * Validate and normalize the extracted structured data.
 */
function validateAndNormalize(extracted) {
  const result = { ...extracted };

  // ── Validate location ──
  if (result.location && !looksLikeLocation(result.location)) {
    result.location = null;
  }

  // ── Validate email ──
  if (result.email && !/^[\w.+\-]+@[\w\-]+\.[\w.\-]+$/.test(result.email)) {
    result.email = null;
  }

  // ── Validate GitHub username ──
  if (result.githubUsername && !/^[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?$/.test(result.githubUsername)) {
    result.githubUsername = null;
  }

  // ── Validate tagline ──
  if (result.tagline) {
    // Must contain a role-like word
    if (!/(?:developer|engineer|designer|analyst|scientist|architect|consultant|intern|researcher|student|manager|lead)/i.test(result.tagline)) {
      result.tagline = null;
    }
  }

  // ── Validate university is not an experience org ──
  if (result.university && result.experienceOrgs && result.experienceOrgs.length > 0) {
    const uniLower = result.university.toLowerCase();
    for (const org of result.experienceOrgs) {
      // If the university matches an experience org AND doesn't have education keywords, reject
      if (uniLower === org.toLowerCase() && !/university|institute|college|school|academy/i.test(result.university)) {
        result.university = null;
        break;
      }
    }
  }

  // ── Validate bio is actually a summary, not a random section ──
  if (result.bio && result.bio.length < 10) {
    result.bio = null;
  }

  // ── Truncate bio ──
  if (result.bio && result.bio.length > 300) {
    result.bio = result.bio.substring(0, 300);
  }

  return result;
}


// ═══════════════════════════════════════════════════════════════════
// STAGE 4: MAP TO FORM SCHEMA
// ═══════════════════════════════════════════════════════════════════

/**
 * Map validated structured data to the exact form field names
 * expected by the frontend.
 */
function mapToFormSchema(validated) {
  const result = {};

  // ── Simple string fields: only include if non-null and non-empty ──
  if (validated.fullName) result.fullName = validated.fullName;
  if (validated.githubUsername) result.githubUsername = validated.githubUsername;
  if (validated.tagline) result.tagline = validated.tagline;
  if (validated.location) result.location = validated.location;
  if (validated.university) result.university = validated.university;
  if (validated.email) result.email = validated.email;
  if (validated.linkedinUsername) result.linkedinUsername = validated.linkedinUsername;
  if (validated.twitterUsername) result.twitterUsername = validated.twitterUsername;

  if (validated.portfolioUrl) {
    result.portfolioUrl = validated.portfolioUrl;
    const domain = validated.portfolioUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    result.websiteDomain = domain;
  }

  // ── Bio → split into bio + buildDesc ──
  if (validated.bio) {
    result.bio = validated.bio.substring(0, 200);
    if (validated.bio.length > 200) {
      result.buildDesc = validated.bio.substring(200, 400);
    }
  }

  // ── Skills → stack rows ──
  if (validated.skills) {
    if (validated.skills.languages) result.stackRow1 = validated.skills.languages;
    if (validated.skills.frameworks) result.stackRow2 = validated.skills.frameworks;
    if (validated.skills.platforms) result.stackRow3 = validated.skills.platforms;
    if (validated.skills.tools) result.stackRow4 = validated.skills.tools;
    if (validated.skills.concepts) result.stackRow5 = validated.skills.concepts;
  }

  // ── Focus areas (derived) ──
  if (validated.skills) {
    const areas = [];
    if (validated.skills.languages) areas.push('Programming');
    if (validated.skills.frameworks) areas.push('Full-Stack');
    if (validated.skills.platforms) areas.push('Cloud/Platform');
    if (validated.skills.concepts) {
      const c = validated.skills.concepts.toLowerCase();
      if (c.includes('machine learning') || c.includes('ai') || c.includes('deep learning')) areas.push('ML/AI');
      if (c.includes('iot') || c.includes('internet of things')) areas.push('IoT');
      if (c.includes('devops')) areas.push('DevOps');
    }
    if (areas.length > 0) result.focusAreas = areas.slice(0, 4).join(' · ');
  }

  // ── Projects ──
  if (validated.projects && validated.projects.length > 0) {
    result.projects = validated.projects;
  }

  // Clean out empty string values
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && !result[key].trim()) {
      delete result[key];
    }
  }

  return result;
}


// ═══════════════════════════════════════════════════════════════════
// EXPORTS FOR TESTING
// ═══════════════════════════════════════════════════════════════════





// Helper to run the full pipeline
function parseTest(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const sections = segmentSections(lines);
  const structured = extractStructured(sections, text);
  const validated = validateAndNormalize(structured);
  return mapToFormSchema(validated);
}

function runTests() {
  let passed = 0;
  let failed = 0;

  function assertEqual(testName, actual, expected) {
    if (actual === expected || (Array.isArray(actual) && Array.isArray(expected) && JSON.stringify(actual) === JSON.stringify(expected))) {
      console.log(`✅ ${testName}`);
      passed++;
    } else {
      console.error(`❌ ${testName}`);
      console.error(`   Expected:`, expected);
      console.error(`   Actual:  `, actual);
      failed++;
    }
  }

  console.log('Running Resume Parser Tests...\n');

  // Test 1: Location extraction
  const t1 = parseTest(`
Bipladip Saha
KOLKATA, WEST BENGAL
bipladip555@gmail.com
  `);
  assertEqual('Test 1: Extract simple location', t1.location, 'KOLKATA, WEST BENGAL');

  // Test 2: Tech stack in projects doesn't bleed into location
  const t2 = parseTest(`
Bipladip Saha
bipladip555@gmail.com

PROJECTS
IoT-Based Monitoring
Tech Stack: ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase
- Did some stuff
  `);
  assertEqual('Test 2: Projects tech stack not in location', t2.location, undefined);
  assertEqual('Test 2: Projects extracted correctly', t2.projects && t2.projects.length > 0 ? t2.projects[0].techStack : undefined, 'ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase');

  // Test 3: GitHub username
  const t3 = parseTest(`
Bipladip Saha
https://github.com/bipladipsaha
  `);
  assertEqual('Test 3: Extract GitHub Username', t3.githubUsername, 'bipladipsaha');

  // Test 4: University extraction under education
  const t4 = parseTest(`
Bipladip Saha

EDUCATION
Bachelor of Technology (B.Tech)
Institute of Engineering and Management, Kolkata
2024 - 2028
  `);
  assertEqual('Test 4: Extract University', t4.university, 'Institute of Engineering and Management, Kolkata');

  // Test 5: Missing location
  const t5 = parseTest(`
Bipladip Saha
bipladip555@gmail.com
  `);
  assertEqual('Test 5: No guessed location', t5.location, undefined);

  // Test 6: Experience orgs not in university
  const t6 = parseTest(`
Bipladip Saha

EXPERIENCE
IDeCLAB, UNIVERSITY OF ENGINEERING AND MANAGEMENT
- Built some cool things
  `);
  assertEqual('Test 6: Experience org not in university', t6.university, undefined);

  // User Resume Integration Test
  const t7 = parseTest(`
BIPLADIP SAHA
bipladip555@gmail.com https://www.linkedin.com/in/bipladip-saha/ https://github.com/bipladipsaha KOLKATA,WEST BENGAL
https://portfolio-three-iota-27.vercel.app/

SUMMARY
Enthusiastic B.Tech CSE (AI & ML) student with strong foundational knowledge...

EXPERIENCE
Title
IDECLAB, UNIVERSITY OF ENGINEERING AND MANAGEMENT
2025- 2026
An open innovation and research-oriented lab focused on fostering...
•Developed a structured inventory management application...

EDUCATION
BachelorofTechnology (B.Tech) in Computer Science & Enineeri ng (AI )
Institute of Engineering and Management, Kolkata
2024 - 2028
CGPA (Till 3rd semester): 8.8/ 10.0

PROJECTS
IoT-BasedMonitoring / Alert System
Tech Stack: ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase
•Developed a real-time IoT system for live location tracking and motion detection.
  `);

  assertEqual('Test 7: Full Name', t7.fullName, 'BIPLADIP SAHA');
  assertEqual('Test 7: GitHub Username', t7.githubUsername, 'bipladipsaha');
  assertEqual('Test 7: Location', t7.location, 'KOLKATA,WEST BENGAL');
  assertEqual('Test 7: University', t7.university, 'Institute of Engineering and Management, Kolkata');
  assertEqual('Test 7: Tech Stack in Project', t7.projects[0].techStack, 'ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase');


  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
