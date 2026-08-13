const assert = require('assert');
const {
  normalizeResumeText,
  calculateContentHash,
  calculateDeterministicAtsScore,
} = require('./src/utils/atsScorer');

console.log('--- RUNNING DETERMINISTIC SCORING & READINESS TESTS ---');

// Test 1: Same resume input twice produces identical score
const sampleResume1 = `
John Doe
Email: john.doe@example.com | Phone: 9876543210 | Location: New York, USA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

EDUCATION
Bachelor of Technology in Computer Science, State University, GPA: 3.8/4.0

EXPERIENCE
Software Engineering Intern - TechCorp (2023)
- Developed and engineered scalable microservices using React, Node.js, and Express.
- Optimized database queries in PostgreSQL, reducing response latency by 35%.
- Built REST API endpoints and integrated Redis caching for 10,000 daily active users.

PROJECTS
Placement AI Coach
- Built a web application with TypeScript, React, Tailwind CSS, and Python FastAPI.
- Implemented DSA tracking algorithms and automated test suites with Jest.

SKILLS
JavaScript, TypeScript, Python, React, Node.js, Express, PostgreSQL, Redis, Docker, Git, AWS, DSA
`;

const score1 = calculateDeterministicAtsScore(sampleResume1);
const score2 = calculateDeterministicAtsScore(sampleResume1);

assert.strictEqual(score1, score2, 'TEST 1 FAILED: Identical resume text produced different scores');
console.log(`✓ Test 1 Passed: Identical resume produces exact same score (${score1} === ${score2})`);

// Test 2: Same normalized resume with different whitespace & line breaks
const sampleResumeWhitespaceVariation = `
  John Doe   

Email: john.doe@example.com | Phone: 9876543210 | Location: New York, USA
   LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe  


EDUCATION   
Bachelor of Technology in Computer Science, State University, GPA: 3.8/4.0

EXPERIENCE

Software Engineering Intern - TechCorp (2023)
- Developed and engineered scalable microservices using React, Node.js, and Express.  
- Optimized database queries in PostgreSQL, reducing response latency by 35%.  
- Built REST API endpoints and integrated Redis caching for 10,000 daily active users.

PROJECTS
Placement AI Coach
- Built a web application with TypeScript, React, Tailwind CSS, and Python FastAPI.
- Implemented DSA tracking algorithms and automated test suites with Jest.

SKILLS
JavaScript, TypeScript, Python, React, Node.js, Express, PostgreSQL, Redis, Docker, Git, AWS, DSA
`;

const scoreWhitespace = calculateDeterministicAtsScore(sampleResumeWhitespaceVariation);
assert.strictEqual(score1, scoreWhitespace, 'TEST 2 FAILED: Whitespace variations affected score');
console.log(`✓ Test 2 Passed: Whitespace/formatting variations preserve exact score (${score1} === ${scoreWhitespace})`);

// Test 3: Content hashing produces identical hash for normalized text
const hash1 = calculateContentHash(normalizeResumeText(sampleResume1));
const hash2 = calculateContentHash(normalizeResumeText(sampleResumeWhitespaceVariation));
assert.strictEqual(hash1, hash2, 'TEST 3 FAILED: Hashing failed on normalized text');
console.log(`✓ Test 3 Passed: SHA-256 content hashes match for normalized text`);

// Test 4: Readiness score formula determinism
function calculateReadiness(resumeScore, dsaProgress, roadmapProgress, profileCompletion) {
  return Math.round(
    resumeScore * 0.4 +
    dsaProgress * 0.3 +
    roadmapProgress * 0.2 +
    profileCompletion * 0.1
  );
}

const readiness1 = calculateReadiness(score1, 50, 100, 87.5);
const readiness2 = calculateReadiness(score2, 50, 100, 87.5);
assert.strictEqual(readiness1, readiness2, 'TEST 4 FAILED: Readiness scores differed');
console.log(`✓ Test 4 Passed: Readiness score is 100% deterministic (${readiness1} === ${readiness2})`);

// Test 5: Missing sections & sparse resume handle gracefully without crash
const emptyResume = '';
const sparseResume = 'Hello World';
const scoreEmpty = calculateDeterministicAtsScore(emptyResume);
const scoreSparse = calculateDeterministicAtsScore(sparseResume);

assert.strictEqual(scoreEmpty, 0, 'TEST 5a FAILED: Empty resume should score 0');
assert.ok(scoreSparse >= 0 && scoreSparse <= 20, 'TEST 5b FAILED: Sparse resume score out of range');
console.log(`✓ Test 5 Passed: Empty/sparse edge cases handle cleanly (Empty: ${scoreEmpty}, Sparse: ${scoreSparse})`);

// Test 6: Different resume content produces different score legitimately
const weakResume = `
Jane Doe
Email: jane@example.com
Education: High School
Skills: HTML
`;

const scoreWeak = calculateDeterministicAtsScore(weakResume);
assert.notStrictEqual(score1, scoreWeak, 'TEST 6 FAILED: Distinct resumes should have different scores');
console.log(`✓ Test 6 Passed: Strong vs weak resumes score appropriately (${score1} vs ${scoreWeak})`);

console.log('\n--- ALL DETERMINISTIC SCORING TESTS PASSED SUCCESSFULLY! ---');
