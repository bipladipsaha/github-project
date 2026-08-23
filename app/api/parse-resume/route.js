import { NextResponse } from 'next/server';

/**
 * POST /api/parse-resume
 * 
 * Accepts a multipart/form-data upload containing a PDF or DOCX resume.
 * Extracts text and parses it into structured form fields using regex heuristics.
 */
export async function POST(request) {
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
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
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

    // ── Parse the extracted text into form fields ──
    const parsed = parseResumeText(rawText);

    return NextResponse.json({
      success: true,
      extracted: parsed,
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

// ─── HEURISTIC RESUME PARSER ───

function parseResumeText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = text;

  const result = {};

  // ── Name: typically the first substantial line ──
  result.fullName = extractName(lines);

  // ── Email ──
  const emailMatch = fullText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) result.email = emailMatch[0];

  // ── Phone ──
  const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  if (phoneMatch) result.phone = phoneMatch[0].trim();

  // ── LinkedIn ──
  const linkedinMatch = fullText.match(/linkedin\.com\/in\/([\w-]+)/i);
  if (linkedinMatch) result.linkedinUsername = linkedinMatch[1];

  // ── GitHub ──
  const githubMatch = fullText.match(/github\.com\/([\w-]+)/i);
  if (githubMatch) result.githubUsername = githubMatch[1];

  // ── Portfolio / Website ──
  const urlMatches = fullText.match(/https?:\/\/(?!(?:github|linkedin|twitter|x)\.com)[^\s,)]+/gi);
  if (urlMatches && urlMatches.length > 0) {
    result.portfolioUrl = urlMatches[0].replace(/[.,;)]+$/, '');
    const domain = result.portfolioUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    result.websiteDomain = domain;
  }

  // ── Twitter / X ──
  const twitterMatch = fullText.match(/(?:twitter|x)\.com\/([\w-]+)/i);
  if (twitterMatch) result.twitterUsername = twitterMatch[1];

  // ── Location ──
  result.location = extractLocation(fullText);

  // ── Education / University ──
  result.university = extractEducation(lines, fullText);

  // ── Summary / Bio ──
  const summary = extractSection(lines, ['summary', 'objective', 'about', 'profile', 'introduction']);
  if (summary) {
    result.bio = summary.substring(0, 200);
    if (summary.length > 200) {
      result.buildDesc = summary.substring(200, 400);
    }
  }

  // ── Tagline: derived from first skill section or job title ──
  result.tagline = extractTagline(lines, fullText);

  // ── Skills → Tech Stack rows ──
  const skills = extractSkills(lines, fullText);
  if (skills) {
    result.stackRow1 = skills.languages || '';
    result.stackRow2 = skills.frameworks || '';
    result.stackRow3 = skills.platforms || '';
    result.stackRow4 = skills.tools || '';
    result.stackRow5 = skills.concepts || '';
  }

  // ── Experience → Projects ──
  result.projects = extractProjects(lines, fullText);

  // ── Focus Areas ──
  result.focusAreas = extractFocusAreas(skills, result.tagline);

  // ── Availability ──
  const availMatch = fullText.match(/(?:open\s+to|seeking|looking\s+for)[^.;\n]{5,60}/i);
  if (availMatch) result.availability = availMatch[0].trim();

  // Clean out empty / undefined values
  for (const key of Object.keys(result)) {
    if (!result[key] || (typeof result[key] === 'string' && !result[key].trim())) {
      delete result[key];
    }
  }

  return result;
}

function extractName(lines) {
  // The name is usually the first line that is 2-4 words, all capitalized or title-cased,
  // and doesn't look like a section header or skill
  const skipWords = new Set(['resume', 'cv', 'curriculum', 'vitae', 'contact', 'summary', 'education', 'experience', 'skills', 'projects', 'references']);
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/[|•·,]/g, '').trim();
    const words = cleaned.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && !skipWords.has(cleaned.toLowerCase())) {
      // Check if it looks like a name (mostly alphabetic)
      if (/^[A-Za-z\s.''-]+$/.test(cleaned) && cleaned.length > 3 && cleaned.length < 50) {
        return cleaned;
      }
    }
  }
  return '';
}

function extractLocation(text) {
  // Look for common location patterns
  const patterns = [
    /(?:address|location|based\s+in|from)\s*[:\-–]?\s*([A-Za-z\s,]+(?:,\s*[A-Z]{2,})?)/i,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*))/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const loc = match[1].trim().replace(/[,.\s]+$/, '');
      if (loc.length > 2 && loc.length < 60) return loc;
    }
  }
  return '';
}

function extractEducation(lines, fullText) {
  const eduIdx = lines.findIndex(l => /^education/i.test(l));
  if (eduIdx === -1) return '';

  // Look at lines after "Education" heading
  const eduLines = lines.slice(eduIdx + 1, eduIdx + 8);
  for (const line of eduLines) {
    if (/university|institute|college|school|iit|nit|iiit|iem|vit|bits|srm/i.test(line)) {
      return line.substring(0, 80);
    }
    // Check if line is a degree
    if (/b\.?tech|b\.?sc|m\.?tech|m\.?sc|bca|mca|b\.?e\b|m\.?e\b|phd|bachelor|master/i.test(line)) {
      return line.substring(0, 80);
    }
  }
  // Fallback: just use first non-empty line after Education
  if (eduLines.length > 0) return eduLines[0].substring(0, 80);
  return '';
}

function extractSection(lines, sectionNames) {
  for (const name of sectionNames) {
    const idx = lines.findIndex(l => new RegExp(`^${name}`, 'i').test(l));
    if (idx === -1) continue;

    const content = [];
    for (let i = idx + 1; i < lines.length && i < idx + 10; i++) {
      const line = lines[i];
      // Stop at next section heading (all caps or known headers)
      if (/^[A-Z\s]{4,30}$/.test(line) && !line.includes('.')) break;
      if (/^(education|experience|skills|projects|work|certif|achiev|interest|reference|language)/i.test(line)) break;
      content.push(line);
    }
    if (content.length > 0) return content.join(' ').trim();
  }
  return '';
}

function extractTagline(lines, fullText) {
  // Look for a job title-like line near the top
  const titlePatterns = [
    /(?:full[- ]?stack|front[- ]?end|back[- ]?end|software|web|mobile|data|ml|ai|devops|cloud)\s*(?:developer|engineer|architect|scientist|analyst|designer)/i,
    /(?:developer|engineer|designer|analyst|scientist|architect|consultant|intern)/i,
  ];
  for (const line of lines.slice(0, 8)) {
    for (const pattern of titlePatterns) {
      if (pattern.test(line)) {
        return line.substring(0, 60);
      }
    }
  }
  return '';
}

function extractSkills(lines, fullText) {
  const skillIdx = lines.findIndex(l => /^(?:skills|technical\s*skills|technologies|tech\s*stack|competenc)/i.test(l));
  if (skillIdx === -1) {
    // Try to find inline skills
    return categorizeSkills(fullText);
  }

  const skillLines = [];
  for (let i = skillIdx + 1; i < lines.length && i < skillIdx + 20; i++) {
    const line = lines[i];
    if (/^[A-Z\s]{4,30}$/.test(line) && !line.includes(',') && !line.includes(':')) break;
    if (/^(education|experience|projects|work|certif|achiev|reference)/i.test(line)) break;
    skillLines.push(line);
  }

  return categorizeSkills(skillLines.join(' '));
}

function categorizeSkills(text) {
  const languages = [];
  const frameworks = [];
  const platforms = [];
  const tools = [];
  const concepts = [];

  const langKeywords = ['python', 'java', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'ruby', 'go', 'golang', 'rust', 'swift', 'kotlin', 'php', 'scala', 'r\\b', 'dart', 'lua', 'perl', 'html', 'css', 'sql', 'bash', 'shell', 'assembly', 'matlab'];
  const fwKeywords = ['react', 'next\\.js', 'nextjs', 'angular', 'vue', 'svelte', 'express', 'fastapi', 'django', 'flask', 'spring', 'node\\.js', 'nodejs', 'tailwind', 'bootstrap', 'jquery', 'laravel', 'rails', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'supabase', 'prisma', 'graphql', 'rest api', 'sqlite'];
  const platKeywords = ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean', 'arduino', 'raspberry pi', 'esp32', 'linux', 'ubuntu', 'android', 'ios'];
  const toolKeywords = ['git', 'github', 'gitlab', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'jira', 'confluence', 'vs code', 'vscode', 'postman', 'figma', 'webpack', 'vite', 'npm', 'yarn', 'pip', 'maven', 'gradle'];
  const conceptKeywords = ['machine learning', 'deep learning', 'artificial intelligence', 'data science', 'data structures', 'algorithms', 'oop', 'agile', 'scrum', 'devops', 'microservices', 'api design', 'system design', 'cloud computing', 'iot', 'blockchain', 'cybersecurity', 'nlp', 'computer vision', 'dsa'];

  const matchAndAdd = (keywords, arr) => {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text)) {
        // Get the matched text with original casing
        const m = text.match(regex);
        if (m && !arr.some(a => a.toLowerCase() === m[0].toLowerCase())) {
          arr.push(m[0]);
        }
      }
    }
  };

  matchAndAdd(langKeywords, languages);
  matchAndAdd(fwKeywords, frameworks);
  matchAndAdd(platKeywords, platforms);
  matchAndAdd(toolKeywords, tools);
  matchAndAdd(conceptKeywords, concepts);

  return {
    languages: languages.join(', '),
    frameworks: frameworks.join(', '),
    platforms: platforms.join(', '),
    tools: tools.join(', '),
    concepts: concepts.join(', '),
  };
}

function extractProjects(lines, fullText) {
  const projects = [];
  const projIdx = lines.findIndex(l => /^(?:projects|personal\s*projects|key\s*projects|featured\s*projects|notable\s*projects)/i.test(l));

  // Fallback: try experience section
  const expIdx = lines.findIndex(l => /^(?:experience|work\s*experience|professional\s*experience|employment)/i.test(l));

  const startIdx = projIdx !== -1 ? projIdx : expIdx;
  if (startIdx === -1) return [];

  let currentProject = null;
  for (let i = startIdx + 1; i < lines.length && projects.length < 5; i++) {
    const line = lines[i];

    // Stop at next major section
    if (/^(education|skills|technical|certif|achiev|reference|interest|language|hobbies)/i.test(line)) break;

    // Detect project/job title lines (they often have tech in parens, or are bold/short)
    const isTitleLine = (
      (line.length < 80 && /[A-Z]/.test(line[0]) && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('–')) ||
      /^\d+\.\s/.test(line) ||
      /^[A-Z][A-Za-z\s]+(?:\s*[-–|]\s*)/.test(line)
    );

    const isDescLine = /^[•\-–▪■*]\s/.test(line) || /^\d+\.\s/.test(line) === false && currentProject;

    if (isTitleLine && !isDescLine) {
      // Save previous project
      if (currentProject && currentProject.name) {
        projects.push(currentProject);
      }
      // Extract tech stack if in parentheses or after pipe
      let name = line;
      let tech = '';
      const techMatch = line.match(/[|(]([^)]+)[)]/);
      if (techMatch) {
        tech = techMatch[1];
        name = line.replace(/\s*[|(][^)]+[)]/, '').trim();
      }
      const dashParts = name.split(/\s*[-–|]\s*/);
      if (dashParts.length > 1) {
        name = dashParts[0].trim();
        if (!tech) tech = dashParts.slice(1).join(', ');
      }
      currentProject = {
        name: name.replace(/^\d+\.\s*/, '').substring(0, 40),
        desc1: '',
        desc2: '',
        techStack: tech.substring(0, 60),
      };
    } else if (currentProject && isDescLine) {
      const desc = line.replace(/^[•\-–▪■*]\s*/, '').trim();
      if (!currentProject.desc1) {
        currentProject.desc1 = desc.substring(0, 120);
      } else if (!currentProject.desc2) {
        currentProject.desc2 = desc.substring(0, 120);
      }
    }
  }

  // Push last project
  if (currentProject && currentProject.name) {
    projects.push(currentProject);
  }

  return projects.slice(0, 5);
}

function extractFocusAreas(skills, tagline) {
  const areas = [];
  if (skills) {
    if (skills.languages) areas.push('Programming');
    if (skills.frameworks) areas.push('Full-Stack');
    if (skills.platforms) areas.push('Cloud/Platform');
    if (skills.concepts) {
      const c = skills.concepts.toLowerCase();
      if (c.includes('machine learning') || c.includes('ai') || c.includes('deep learning')) areas.push('ML/AI');
      if (c.includes('iot')) areas.push('IoT');
      if (c.includes('devops')) areas.push('DevOps');
      if (c.includes('data')) areas.push('Data');
    }
  }
  if (areas.length === 0 && tagline) {
    return tagline;
  }
  return areas.slice(0, 4).join(' · ');
}
