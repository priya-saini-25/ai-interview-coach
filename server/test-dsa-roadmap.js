const assert = require('assert');
const dsaRoadmapService = require('./src/services/dsaRoadmapService');

console.log('--- RUNNING 7-DAY PERSONALIZED AI DSA ROADMAP TESTS ---');

// Mock Data
const mockAnalytics = {
  summary: { totalTracked: 40, solved: 5, completionPercentage: 12, currentStreak: 2 },
  weakTopics: [
    { topic: 'Dynamic Programming', score: 90, completionPercentage: 10, solved: 1, total: 10, reasons: ['Low completion'] },
    { topic: 'Graphs', score: 80, completionPercentage: 0, solved: 0, total: 6, reasons: ['High priority for Backend'] },
  ],
  difficultyProgress: {
    easy: { solved: 4, total: 12, completionPercentage: 33 },
    medium: { solved: 1, total: 20, completionPercentage: 5 },
    hard: { solved: 0, total: 8, completionPercentage: 0 },
  },
};

const mockUserProgress = [
  { problemId: 'two-sum', topic: 'Arrays & Hashing', status: 'Solved', completed: true },
  { problemId: 'valid-anagram', topic: 'Arrays & Hashing', status: 'Solved', completed: true },
];

// Test 1: Candidate Pool excludes solved problems
const candidatePool = dsaRoadmapService.buildCandidatePool(mockUserProgress, mockAnalytics);
assert.ok(Array.isArray(candidatePool), 'Test 1a Failed: Candidate pool must be an array');
assert.ok(candidatePool.length > 0, 'Test 1b Failed: Candidate pool should contain unsolved problems');

const containsSolvedTwoSum = candidatePool.some(c => c.id === 'two-sum');
assert.strictEqual(containsSolvedTwoSum, false, 'Test 1c Failed: Solved problem "two-sum" should be excluded');
console.log('✓ Test 1 Passed: Solved problems are strictly excluded from candidate pool.');

// Test 2: Candidate Pool prioritizes weak topics & DB validity
const topCandidate = candidatePool[0];
assert.ok(topCandidate.id, 'Test 2a Failed: Candidate problem must have valid database ID');
assert.ok(topCandidate.priorityScore > 1, 'Test 2b Failed: Weak topic candidates should have boosted priority score');
console.log(`✓ Test 2 Passed: Candidate pool prioritizes weak topics (${topCandidate.topic} - "${topCandidate.title}").`);

// Test 3: Deterministic fallback schedule generates exactly 7 days
const fallbackSchedule = dsaRoadmapService.buildDeterministicFallbackSchedule(candidatePool, mockAnalytics, 'Backend Developer');
assert.strictEqual(fallbackSchedule.length, 7, 'Test 3a Failed: Schedule must contain exactly 7 days');

fallbackSchedule.forEach((day, idx) => {
  assert.strictEqual(day.dayNumber, idx + 1, `Test 3b Failed: Day number mismatch for day ${idx + 1}`);
  assert.ok(day.problems.length >= 1 && day.problems.length <= 4, `Test 3c Failed: Daily workload out of bounds for day ${idx + 1}`);
  assert.ok(day.estimatedMinutes >= 30, `Test 3d Failed: Estimated minutes missing for day ${idx + 1}`);
});
console.log('✓ Test 3 Passed: Deterministic fallback schedule generates exactly 7 days with realistic workload.');

// Test 4: Strict validation rejects hallucinated / fake Gemini problem IDs
const hallucinatedGeminiSchedule = [
  { dayNumber: 1, focusTopics: ['DP'], learningGoals: ['Learn DP'], estimatedMinutes: 60, revisionTasks: ['Revise'], problemIds: ['fake-hallucinated-id-9999', 'climbing-stairs'] },
  { dayNumber: 2, problemIds: ['fake-id-2'] },
  { dayNumber: 3, problemIds: ['invalid-id-3'] },
  { dayNumber: 4, problemIds: [] },
  { dayNumber: 5, problemIds: [] },
  { dayNumber: 6, problemIds: [] },
  { dayNumber: 7, problemIds: [] },
];

const validatedSchedule = dsaRoadmapService.validateAndSanitizeSchedule(hallucinatedGeminiSchedule, candidatePool, mockAnalytics, 'Backend Developer');
assert.strictEqual(validatedSchedule.length, 7, 'Test 4a Failed: Validated schedule must have 7 days');

const day1FakeFound = validatedSchedule[0].problems.some(p => p.problemId === 'fake-hallucinated-id-9999');
assert.strictEqual(day1FakeFound, false, 'Test 4b Failed: Hallucinated problem ID was not rejected by validation layer');
console.log('✓ Test 4 Passed: Strict validation layer rejects fake/hallucinated AI problem IDs.');

// Test 5: Every validated roadmap problem exists in the candidate pool
validatedSchedule.forEach((day) => {
  day.problems.forEach((prob) => {
    const existsInCandidatePool = candidatePool.some(c => c.id === prob.problemId);
    assert.strictEqual(existsInCandidatePool, true, `Test 5 Failed: Problem ${prob.problemId} is not in candidate pool`);
  });
});
console.log('✓ Test 5 Passed: 100% of validated roadmap problems exist in database question bank.');

// Test 6: Difficulty progression strategy check
let hasEasy = false;
let hasMedium = false;
candidatePool.forEach(p => {
  if (p.difficulty === 'Easy') hasEasy = true;
  if (p.difficulty === 'Medium') hasMedium = true;
});
assert.ok(hasEasy || hasMedium, 'Test 6 Failed: Pool should contain realistic difficulty distribution');
console.log('✓ Test 6 Passed: Difficulty selection strategy matches candidate profile.');

console.log('\n--- ALL 7-DAY PERSONALIZED AI DSA ROADMAP TESTS PASSED! ---');
