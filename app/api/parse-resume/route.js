import { NextResponse } from 'next/server';

/**
 * POST /api/parse-resume
 * 
 * Uses Semantic Anchor Segmentation.
 * Because `pdf-parse` can scramble section headers and content, we don't
 * rely on header order. Instead, we use semantic anchors (e.g. degrees, dates)
 * to locate fields.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = '';

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
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json({ error: 'Could not extract enough text.' }, { status: 422 });
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const structured = extractStructured(lines, rawText);
    const validated = validateAndNormalize(structured);
    const formFields = mapToFormSchema(validated);

    return NextResponse.json({
      success: true,
      extracted: formFields,
      rawTextPreview: rawText.substring(0, 500),
    });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse.' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 1: STRUCTURED EXTRACTION (Semantic Anchors)
// ═══════════════════════════════════════════════════════════════════

function extractStructured(lines, fullText) {
  return {
    fullName: extractName(lines),
    githubUsername: extractGithubUsername(fullText),
    email: extractEmail(fullText),
    linkedinUsername: extractLinkedin(fullText),
    portfolioUrl: extractPortfolio(fullText),
    location: extractLocation(lines),
    tagline: extractTagline(lines),
    university: extractUniversity(lines),
    bio: extractBio(lines),
    skills: categorizeSkills(fullText),
    projects: extractProjects(lines),
    experienceOrgs: extractExperienceOrgs(lines),
  };
}

function extractName(lines) {
  const skipWords = new Set(['resume', 'cv', 'summary', 'education', 'experience', 'skills', 'projects', 'address', 'email', 'linkedin', 'github']);
  
  // Name is usually near the top, but could be pushed down by columns
  for (let i = 0; i < Math.min(40, lines.length); i++) {
    const line = lines[i];
    const cleaned = line.replace(/[|•·,]/g, '').trim();
    if (/[@:/]/.test(cleaned) || /\d{5,}/.test(cleaned) || /^https?:/.test(cleaned)) continue;
    if (looksLikeTechList(cleaned) || looksLikeLocation(cleaned)) continue;

    const words = cleaned.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && !skipWords.has(cleaned.toLowerCase())) {
      if (/^[A-Za-z\s.''\-]+$/.test(cleaned) && cleaned.length > 3 && cleaned.length < 40) {
        // Ensure it doesn't look like a section header
        if (!/^(?:education|experience|projects|skills|summary)$/i.test(cleaned)) {
          return cleaned;
        }
      }
    }
  }
  return null;
}

function extractGithubUsername(text) {
  const match = text.match(/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?)/i);
  return match ? match[1] : null;
}

function extractEmail(text) {
  const match = text.match(/[\w.+\-]+@[\w\-]+\.[\w.\-]+/);
  return match ? match[0] : null;
}

function extractLinkedin(text) {
  const match = text.match(/linkedin\.com\/in\/([\w\-]+)/i);
  return match ? match[1] : null;
}

function extractPortfolio(text) {
  const matches = text.match(/https?:\/\/(?!(?:github|linkedin|twitter|x)\.com)[^\s,)]+/gi);
  if (matches && matches.length > 0) {
    return matches[0].replace(/[.,;)]+$/, '');
  }
  return null;
}

function extractLocation(lines) {
  // Location usually in top 40 lines
  for (let i = 0; i < Math.min(40, lines.length); i++) {
    const line = lines[i];
    if (/[@:/]/.test(line) || /^https?:/.test(line)) continue;

    const cityStateMatches = line.matchAll(/([A-Z][A-Za-z \t]+,\s*[A-Z][A-Za-z \t]+)/g);
    for (const match of cityStateMatches) {
      const candidate = match[1].trim();
      if (looksLikeLocation(candidate) && candidate.length < 50) return candidate;
    }
    if (line.length < 40 && looksLikeLocation(line.trim())) {
      return line.trim();
    }
  }
  return null;
}

function extractTagline(lines) {
  const rolePatterns = [
    /(?:full[\s\-]?stack|front[\s\-]?end|back[\s\-]?end|software|web|mobile|data|ml|ai|devops|cloud|embedded|iot|machine\s*learning)\s*(?:developer|engineer|architect|scientist|analyst|designer)/i,
    /\bB\.?\s*Tech\b.*?\bstudent\b/i,
    /\b(?:developer|engineer|designer|analyst|scientist|architect|consultant|intern|researcher|student)\b/i,
  ];

  for (const line of lines) {
    if (line.length > 150) continue; 
    if (/[@:/]/.test(line) || /\d{5,}/.test(line)) continue;

    for (const pattern of rolePatterns) {
      if (pattern.test(line)) {
        const match = line.match(pattern);
        if (match && line.length < 60) return line.trim();
        if (match) return match[0].trim();
      }
    }
  }
  return null;
}

function extractUniversity(lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Anchor: Degree
    if (/\b(?:b\.?\s*tech|b\.?\s*e\b|b\.?\s*sc|m\.?\s*tech|m\.?\s*e\b|m\.?\s*sc|bca|mca|phd|bachelor|master|diploma)/i.test(line)) {
      const start = Math.max(0, i - 4);
      const end = Math.min(lines.length - 1, i + 4);
      for (let j = start; j <= end; j++) {
        const contextLine = lines[j];
        if (/(?:university|institute|college|school)\s+(?:of|for)\s+/i.test(contextLine) ||
            /\b(?:IIT|NIT|IIIT|IEM|VIT|BITS|SRM|MIT|IISC|AIIMS)\b/.test(contextLine) ||
            /\b(?:university|institute|college|school|academy|polytechnic)\b/i.test(contextLine)) {
          return cleanEducationLine(contextLine);
        }
      }
    }
  }
  return null;
}

function cleanEducationLine(line) {
  return line.replace(/^[•\-–▪■*\d.]+\s*/, '')
    .replace(/\s*[\(\[]?\d{4}\s*[-–]\s*(?:\d{4}|present|ongoing)[\)\]]?\s*$/i, '')
    .trim().substring(0, 100);
}

function extractExperienceOrgs(lines) {
  const orgs = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Anchor: Date range e.g. 2024 - 2028
    if (/^\s*(?:19|20)\d{2}\s*[-–]\s*(?:(?:19|20)\d{2}|present|ongoing|current)\s*$/i.test(line)) {
      let isEdu = false;
      const start = Math.max(0, i - 4);
      const end = Math.min(lines.length - 1, i + 4);
      for (let j = start; j <= end; j++) {
        if (/\b(?:b\.?\s*tech|b\.?\s*e\b|b\.?\s*sc|m\.?\s*tech|m\.?\s*e\b|m\.?\s*sc|bachelor|master|degree)\b/i.test(lines[j])) {
          isEdu = true;
          break;
        }
      }
      if (!isEdu) {
        for (let j = start; j <= end; j++) {
          const contextLine = lines[j];
          if (contextLine !== line && contextLine.length < 80 && /^[A-Z]/.test(contextLine) && !contextLine.startsWith('•') && !/^(?:experience|projects|education)$/i.test(contextLine)) {
            orgs.push(contextLine.trim());
          }
        }
      }
    }
  }
  return orgs;
}

function extractBio(lines) {
  // Find a long paragraph that looks like a summary
  for (const line of lines) {
    if (line.length > 150 && !looksLikeTechList(line) && !/^•/.test(line)) {
      return line.trim();
    }
  }
  return '';
}

function extractProjects(lines) {
  const projects = [];
  const consumedLines = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(?:education|skills|summary|experience)$/i.test(line)) continue;

    const isBullet = /^[•\-–▪■*]\s/.test(line);
    const isTitleLine = (
      !isBullet && line.length > 3 && line.length < 80 &&
      /[A-Z]/.test(line[0]) &&
      !/^\d{4}/.test(line) && !/cgpa|gpa|percentage/i.test(line) &&
      !/^(?:projects?|summary|education|experience)$/i.test(line) &&
      !/^(?:tech(?:nology|nologies|[\s\-]*stack)?|built\s*with|tools?\s*used|stack)\s*[:\-–]/i.test(line)
    );

    if (isTitleLine) {
      let isProject = false;
      let techStack = '';
      
      // Look around for explicit tech stack
      for (let j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 4); j++) {
        if (consumedLines.has(j)) continue;
        const ctx = lines[j];
        const tsMatch = ctx.match(/^(?:tech(?:nology|nologies|[\s\-]*stack)?|built\s*with|tools?\s*used|stack)\s*[:\-–]\s*(.+)/i);
        if (tsMatch) {
          techStack = tsMatch[1].trim().substring(0, 150);
          consumedLines.add(j);
          isProject = true;
          break;
        }
        if (/^[•\-–▪■*]\s/.test(ctx)) {
          isProject = true; // bullets nearby indicate a project
        }
      }

      if (!techStack) {
        // Look for implicit tech list
        for (let j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 4); j++) {
          if (consumedLines.has(j)) continue;
          const ctx = lines[j].replace(/^[•\-–▪■*]\s*/, '').trim();
          if (looksLikeTechList(ctx)) {
            techStack = ctx.substring(0, 150);
            consumedLines.add(j);
            isProject = true;
            break;
          }
        }
      }

      if (isProject) {
        let currentProject = {
          name: line.replace(/^\d+\.\s*/, '').substring(0, 80),
          desc1: '',
          desc2: '',
          techStack: techStack
        };
        
        // Find descriptions
        let descCount = 0;
        for (let j = Math.max(0, i - 4); j < Math.min(lines.length, i + 6); j++) {
          if (consumedLines.has(j)) continue;
          if (/^[•\-–▪■*]\s/.test(lines[j])) {
            const desc = lines[j].replace(/^[•\-–▪■*]\s*/, '').trim();
            if (descCount === 0) currentProject.desc1 = desc.substring(0, 150);
            else if (descCount === 1) currentProject.desc2 = desc.substring(0, 150);
            descCount++;
            consumedLines.add(j);
          }
        }
        projects.push(currentProject);
        if (projects.length >= 5) break;
      }
    }
  }

  return projects;
}

function categorizeSkills(text) {
  const categories = { languages: [], frameworks: [], platforms: [], tools: [], concepts: [] };
  const definitions = {
    languages: ['python', 'java(?!script)', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'ruby', 'golang', 'go(?=\\s|,|$)', 'rust', 'swift', 'kotlin', 'php', 'scala', 'dart', 'html', 'css', 'sql', 'bash', 'matlab'],
    frameworks: ['react(?!\\.)', 'next\\.?js', 'angular', 'vue(?:\\.?js)?', 'svelte', 'express(?:\\.?js)?', 'fastapi', 'django', 'flask', 'spring(?:\\s*boot)?', 'node\\.?js', 'tailwind(?:\\s*css)?', 'bootstrap', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'supabase', 'graphql', 'rest\\s*api', 'tensorflow', 'pytorch', 'keras', 'scikit[\\-\\s]?learn', 'pandas', 'numpy', 'opencv', 'streamlit'],
    platforms: ['aws', 'azure', 'gcp', 'google\\s*cloud', 'heroku', 'vercel', 'netlify', 'arduino', 'raspberry\\s*pi', 'esp32', 'esp8266', 'linux', 'android', 'ios'],
    tools: ['git(?!hub)', 'github', 'gitlab', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'jira', 'vs\\s*code', 'vscode', 'postman', 'figma', 'webpack', 'vite', 'npm', 'yarn', 'pip', 'jupyter', 'colab'],
    concepts: ['machine\\s*learning', 'deep\\s*learning', 'artificial\\s*intelligence', 'data\\s*science', 'data\\s*structures', 'algorithms', 'oop', 'agile', 'devops', 'microservices', 'api\\s*design', 'cloud\\s*computing', 'iot', 'internet\\s*of\\s*things', 'blockchain', 'cybersecurity', 'nlp', 'computer\\s*vision'],
  };

  for (const [category, keywords] of Object.entries(definitions)) {
    for (const kw of keywords) {
      const match = text.match(new RegExp(`\\b${kw}\\b`, 'i'));
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

function looksLikeTechList(str) {
  const parts = str.split(/[,;|·•]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  const shortParts = parts.filter(p => p.split(/\s+/).length <= 3 && p.length < 30);
  return shortParts.length / parts.length >= 0.7;
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 2: SEMANTIC VALIDATION
// ═══════════════════════════════════════════════════════════════════

const TECH_TERMS = new Set(['accelerometer', 'gyroscope', 'gsm', 'gps', 'sensor', 'module', 'arduino', 'raspberry', 'esp32', 'esp8266', 'servo', 'motor', 'resistor', 'capacitor', 'transistor', 'diode', 'led', 'lcd', 'oled', 'buzzer', 'relay', 'actuator', 'microcontroller', 'breadboard', 'pcb', 'soldering', 'uart', 'spi', 'i2c', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'tensorflow', 'pytorch', 'keras', 'opencv', 'pandas', 'numpy', 'firebase', 'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'python', 'java', 'javascript', 'typescript', 'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'dart', 'lua', 'perl', 'html', 'css', 'sql', 'bash', 'matlab', 'api', 'sdk', 'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify', 'algorithm', 'framework', 'library', 'database', 'server', 'frontend', 'backend', 'fullstack', 'devops', 'pipeline', 'deployment', 'ci/cd', 'testing', 'debugging', 'encryption', 'authentication', 'authorization', 'webhook', 'endpoint', 'machine', 'learning', 'neural', 'network', 'model', 'training']);

const GEO_TERMS = new Set(['west bengal', 'maharashtra', 'karnataka', 'tamil nadu', 'kerala', 'telangana', 'andhra pradesh', 'uttar pradesh', 'rajasthan', 'gujarat', 'madhya pradesh', 'bihar', 'odisha', 'jharkhand', 'chhattisgarh', 'assam', 'punjab', 'haryana', 'himachal pradesh', 'uttarakhand', 'goa', 'tripura', 'meghalaya', 'manipur', 'mizoram', 'nagaland', 'arunachal pradesh', 'sikkim', 'delhi', 'new delhi', 'kolkata', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'noida', 'gurgaon', 'gurugram', 'chandigarh', 'coimbatore', 'kochi', 'trivandrum', 'dehradun', 'ranchi', 'bhubaneswar', 'raipur', 'india', 'usa', 'united states', 'uk', 'united kingdom', 'canada', 'australia', 'germany', 'france', 'japan', 'singapore', 'dubai', 'uae', 'united arab emirates', 'california', 'new york', 'texas', 'florida', 'washington', 'massachusetts', 'illinois', 'pennsylvania', 'georgia', 'ohio', 'virginia', 'north carolina', 'new jersey', 'colorado', 'oregon', 'ca', 'ny', 'tx', 'fl', 'wa', 'ma', 'il', 'pa', 'ga', 'oh', 'va', 'nc', 'nj', 'co', 'or', 'ct', 'md', 'mn', 'wi', 'az', 'wb']);

function looksLikeLocation(str) {
  if (!str || str.length < 2 || str.length > 60) return false;
  const lower = str.toLowerCase();
  const words = lower.split(/[\s,;]+/);
  for (const word of words) {
    if (TECH_TERMS.has(word)) return false;
  }
  if (words.length > 6) return false;
  for (const geo of GEO_TERMS) {
    if (new RegExp(`\\b${geo}\\b`, 'i').test(lower)) return true;
  }
  if (/^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(str) && words.length <= 5) {
    const parts = str.split(',').map(p => p.trim());
    if (parts.every(p => p.length >= 2 && p.length < 30)) return true;
  }
  return false;
}

function validateAndNormalize(extracted) {
  const result = { ...extracted };

  if (result.location && !looksLikeLocation(result.location)) result.location = null;
  if (result.email && !/^[\w.+\-]+@[\w\-]+\.[\w.\-]+$/.test(result.email)) result.email = null;
  if (result.githubUsername && !/^[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?$/.test(result.githubUsername)) result.githubUsername = null;
  
  if (result.tagline && !/(?:developer|engineer|designer|analyst|scientist|architect|consultant|intern|researcher|student|lead)/i.test(result.tagline)) {
    result.tagline = null;
  }

  if (result.university && result.experienceOrgs && result.experienceOrgs.length > 0) {
    const uniLower = result.university.toLowerCase();
    for (const org of result.experienceOrgs) {
      if (uniLower === org.toLowerCase() && !/university|institute|college|school|academy/i.test(result.university)) {
        result.university = null;
        break;
      }
    }
  }

  if (result.bio && result.bio.length < 10) result.bio = null;
  if (result.bio && result.bio.length > 300) result.bio = result.bio.substring(0, 300);

  return result;
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 3: MAP TO FORM SCHEMA
// ═══════════════════════════════════════════════════════════════════

function mapToFormSchema(validated) {
  const result = {};

  if (validated.fullName) result.fullName = validated.fullName;
  if (validated.githubUsername) result.githubUsername = validated.githubUsername;
  if (validated.tagline) result.tagline = validated.tagline;
  if (validated.location) result.location = validated.location;
  if (validated.university) result.university = validated.university;
  if (validated.email) result.email = validated.email;
  if (validated.linkedinUsername) result.linkedinUsername = validated.linkedinUsername;
  
  if (validated.portfolioUrl) {
    result.portfolioUrl = validated.portfolioUrl;
    result.websiteDomain = validated.portfolioUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  if (validated.bio) {
    result.bio = validated.bio.substring(0, 200);
    if (validated.bio.length > 200) result.buildDesc = validated.bio.substring(200, 400);
  }

  if (validated.skills) {
    if (validated.skills.languages) result.stackRow1 = validated.skills.languages;
    if (validated.skills.frameworks) result.stackRow2 = validated.skills.frameworks;
    if (validated.skills.platforms) result.stackRow3 = validated.skills.platforms;
    if (validated.skills.tools) result.stackRow4 = validated.skills.tools;
    if (validated.skills.concepts) result.stackRow5 = validated.skills.concepts;
    
    const areas = [];
    if (validated.skills.languages) areas.push('Programming');
    if (validated.skills.frameworks) areas.push('Full-Stack');
    if (validated.skills.platforms) areas.push('Cloud');
    if (validated.skills.concepts) {
      const c = validated.skills.concepts.toLowerCase();
      if (c.includes('machine learning') || c.includes('ai')) areas.push('ML/AI');
      if (c.includes('iot')) areas.push('IoT');
    }
    if (areas.length > 0) result.focusAreas = areas.slice(0, 4).join(' · ');
  }

  if (validated.projects && validated.projects.length > 0) {
    result.projects = validated.projects;
  }

  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && !result[key].trim()) delete result[key];
  }

  return result;
}

export {
  extractStructured,
  validateAndNormalize,
  mapToFormSchema,
  looksLikeLocation
};
