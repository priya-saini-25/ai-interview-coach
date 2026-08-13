const crypto = require('crypto');

/**
 * Normalizes raw text extracted from a resume.
 * Trims whitespace, standardizes CRLF/CR to LF, collapses redundant spaces/tabs and excessive newlines.
 * @param {string} text
 * @returns {string}
 */
const normalizeResumeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
};

/**
 * Computes SHA-256 hash of normalized text for exact duplicate detection.
 * @param {string} normalizedText
 * @returns {string}
 */
const calculateContentHash = (normalizedText) => {
  return crypto
    .createHash('sha256')
    .update(normalizedText || '')
    .digest('hex');
};

/**
 * Calculates a deterministic ATS score between 0 and 100 based on fixed rubric rules.
 * @param {string} rawText
 * @returns {number} Integer between 0 and 100
 */
const calculateDeterministicAtsScore = (rawText) => {
  const normalized = normalizeResumeText(rawText);
  if (!normalized) return 0;

  const lowerText = normalized.toLowerCase();

  // 1. Contact Information & Metadata (Max 15 points)
  let contactScore = 0;
  // Email check
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(normalized) || lowerText.includes('email')) {
    contactScore += 4;
  }
  // Phone check
  if (/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(normalized) || /\b\d{10}\b/.test(normalized) || lowerText.includes('phone') || lowerText.includes('mobile')) {
    contactScore += 4;
  }
  // Portfolio / LinkedIn / GitHub URL check
  if (/linkedin\.com|github\.com|portfolio|http:\/\/|https:\/\//i.test(normalized)) {
    contactScore += 4;
  }
  // Location check
  if (/location|address|city|india|usa|street|zip|state/i.test(lowerText) || /[a-z]+,\s*[a-z]+/i.test(normalized)) {
    contactScore += 3;
  }
  contactScore = Math.min(15, contactScore);

  // 2. Core Sections Presence (Max 25 points)
  let sectionScore = 0;
  // Education (+5)
  if (/education|academic|b\.tech|bachelor|master|degree|gpa|university|college|school/i.test(lowerText)) {
    sectionScore += 5;
  }
  // Experience / Internships (+6)
  if (/experience|work|internship|employment|job|position|role|company/i.test(lowerText)) {
    sectionScore += 6;
  }
  // Projects (+6)
  if (/project|built|developed|application|portfolio|github/i.test(lowerText)) {
    sectionScore += 6;
  }
  // Skills (+5)
  if (/skills|technologies|proficiencies|technical|stack|tools/i.test(lowerText)) {
    sectionScore += 5;
  }
  // Certifications / Achievements (+3)
  if (/certification|certificate|achievement|award|honor|extracurricular|publication/i.test(lowerText)) {
    sectionScore += 3;
  }
  sectionScore = Math.min(25, sectionScore);

  // 3. Technical Keywords & Skill Depth (Max 25 points)
  const techKeywords = [
    // Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust', 'ruby', 'php', 'html', 'css', 'sql',
    // Web & Frameworks
    'react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'nest', 'django', 'flask', 'fastapi', 'spring', 'springboot', 'bootstrap', 'tailwind',
    // Databases & Cache
    'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'prisma',
    // DevOps & Cloud
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'gitlab', 'linux', 'nginx', 'vercel',
    // Concepts & Tools
    'rest api', 'restful', 'graphql', 'microservices', 'agile', 'dsa', 'data structures', 'algorithms', 'system design', 'oop', 'object-oriented', 'testing', 'jest', 'vite'
  ];

  let keywordMatches = 0;
  for (const keyword of techKeywords) {
    if (lowerText.includes(keyword)) {
      keywordMatches++;
    }
  }
  const keywordScore = Math.min(25, Math.round(keywordMatches * 2.5));

  // 4. Measurable Achievements & Action Verbs (Max 20 points)
  const actionVerbs = [
    'developed', 'designed', 'built', 'implemented', 'engineered', 'spearheaded',
    'optimized', 'led', 'architected', 'automated', 'created', 'launched',
    'refactored', 'integrated', 'managed', 'improved', 'increased', 'reduced'
  ];

  let verbCount = 0;
  for (const verb of actionVerbs) {
    if (lowerText.includes(verb)) {
      verbCount++;
    }
  }
  const verbScore = Math.min(10, verbCount);

  // Quantifiable metrics (numbers with %, $, k, x, ms, users, clients, etc.)
  const metricsMatches = (normalized.match(/\b\d+(\.\d+)?\s*(%|\+|\$|k|x|ms|users|clients|percent|seconds|minutes|hours|people|team)\b/gi) || []).length;
  const metricsScore = Math.min(10, Math.round(metricsMatches * 2.5));

  const achievementScore = Math.min(20, verbScore + metricsScore);

  // 5. Structure, Length & Formatting Quality (Max 15 points)
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let lengthScore = 0;
  if (wordCount < 50) {
    lengthScore = 2;
  } else if (wordCount < 150) {
    lengthScore = 6;
  } else if (wordCount <= 800) {
    lengthScore = 15;
  } else {
    lengthScore = 10;
  }

  // Calculate final overall ATS score
  const totalScore = contactScore + sectionScore + keywordScore + achievementScore + lengthScore;
  return Math.min(100, Math.max(0, Math.round(totalScore)));
};

module.exports = {
  normalizeResumeText,
  calculateContentHash,
  calculateDeterministicAtsScore,
};
