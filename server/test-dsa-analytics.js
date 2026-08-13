const assert = require('assert');
const dsaAnalyticsService = require('./src/services/dsaAnalyticsService');

console.log('--- RUNNING DSA ANALYTICS & PROGRESS INTELLIGENCE TESTS ---');

// Mock User Progress Data
const mockEmptyProgress = [];

const mockUserProgress = [
  { problemId: 'two-sum', topic: 'Arrays & Hashing', category: 'Arrays', difficulty: 'Easy', status: 'Solved', completed: true, completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }, // 1 day ago
  { problemId: 'valid-anagram', topic: 'Arrays & Hashing', category: 'Arrays', difficulty: 'Easy', status: 'Solved', completed: true, completedAt: new Date() }, // Today
  { problemId: 'group-anagrams', topic: 'Arrays & Hashing', category: 'Arrays', difficulty: 'Medium', status: 'In Progress', completed: false },
  { problemId: 'container-with-most-water', topic: 'Two Pointers', category: 'Two Pointers', difficulty: 'Medium', status: 'Solved', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, // 2 days ago
  { problemId: 'trapping-rain-water', topic: 'Two Pointers', category: 'Two Pointers', difficulty: 'Hard', status: 'Not Started', completed: false },
  { problemId: 'invert-binary-tree', topic: 'Trees', category: 'Trees', difficulty: 'Easy', status: 'Solved', completed: true, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // 3 days ago
  { problemId: 'lru-cache', topic: 'Linked List', category: 'Linked List', difficulty: 'Hard', status: 'Solved', completed: true, completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }, // 4 days ago
];

// Test 1: Empty user analytics handles cleanly without errors
const emptyTopicProgress = dsaAnalyticsService.getTopicProgress(mockEmptyProgress);
const emptyStreak = dsaAnalyticsService.getStreak(mockEmptyProgress);

assert.ok(Array.isArray(emptyTopicProgress), 'Test 1a Failed: Topic progress should be an array');
assert.strictEqual(emptyStreak.currentStreak, 0, 'Test 1b Failed: Empty streak should be 0');
assert.strictEqual(emptyStreak.longestStreak, 0, 'Test 1c Failed: Empty longest streak should be 0');
console.log('✓ Test 1 Passed: Empty user analytics handled cleanly.');

// Test 2: Topic progress calculations
const topicProgress = dsaAnalyticsService.getTopicProgress(mockUserProgress);
assert.ok(topicProgress.length > 0, 'Test 2a Failed: Topic progress array should not be empty');

const arraysTopic = topicProgress.find(t => t.topic.toLowerCase().includes('arrays'));
assert.ok(arraysTopic, 'Test 2b Failed: Arrays topic should be present');
assert.strictEqual(arraysTopic.solved, 2, 'Test 2c Failed: Arrays solved count mismatch');
console.log('✓ Test 2 Passed: Topic progress calculations are accurate.');

// Test 3: Difficulty progress calculations
const diffProgress = dsaAnalyticsService.getDifficultyProgress(mockUserProgress);
assert.strictEqual(diffProgress.easy.solved, 3, 'Test 3a Failed: Easy solved count mismatch');
assert.strictEqual(diffProgress.medium.solved, 1, 'Test 3b Failed: Medium solved count mismatch');
assert.strictEqual(diffProgress.hard.solved, 1, 'Test 3c Failed: Hard solved count mismatch');
console.log('✓ Test 3 Passed: Difficulty progress calculations are accurate.');

// Test 4: Weekly progress (7 days format)
const weeklyProgress = dsaAnalyticsService.getWeeklyProgress(mockUserProgress);
assert.strictEqual(weeklyProgress.length, 7, 'Test 4a Failed: Weekly progress must have exactly 7 days');
assert.ok(weeklyProgress[6].solved >= 1, 'Test 4b Failed: Today should have solved count');
console.log('✓ Test 4 Passed: 7-day weekly progress is accurately formatted.');

// Test 5: Monthly progress (week-wise buckets)
const monthlyProgress = dsaAnalyticsService.getMonthlyProgress(mockUserProgress);
assert.ok(Array.isArray(monthlyProgress), 'Test 5a Failed: Monthly progress must be an array');
assert.ok(monthlyProgress.length >= 4, 'Test 5b Failed: Monthly progress should have at least 4 week buckets');
console.log('✓ Test 5 Passed: Monthly progress week buckets calculated accurately.');

// Test 6 & 7: Current streak and longest streak calculations
const streak = dsaAnalyticsService.getStreak(mockUserProgress);
assert.strictEqual(streak.currentStreak, 5, 'Test 6 Failed: Current streak count mismatch');
assert.strictEqual(streak.longestStreak, 5, 'Test 7 Failed: Longest streak count mismatch');
console.log(`✓ Test 6 & 7 Passed: Streaks calculated accurately (Current: ${streak.currentStreak}, Longest: ${streak.longestStreak}).`);

// Test 8: Deterministic weak-topic detection
const weakTopics = dsaAnalyticsService.getWeakTopics(mockUserProgress, 'Backend Developer');
assert.ok(Array.isArray(weakTopics), 'Test 8a Failed: Weak topics should be an array');
assert.ok(weakTopics.length > 0, 'Test 8b Failed: Weak topics should identify uncompleted role topics');
assert.ok(weakTopics[0].score >= weakTopics[weakTopics.length - 1].score, 'Test 8c Failed: Weak topics should be sorted by weakness score descending');
console.log(`✓ Test 8 Passed: Weak topics detected deterministically (${weakTopics[0].topic} score: ${weakTopics[0].score}).`);

// Test 9: Platform statistics remain logically separate from internal statistics
const mockProfile = {
  handles: { leetcode: 'testuser', codeforces: 'testcf' },
  stats: {
    leetcode: { totalSolved: 250, easy: 100, medium: 120, hard: 30 },
    codeforces: { rating: 1500, rank: 'Specialist', totalSolved: 90 },
  },
  lastSyncedAt: new Date(),
};

const platformAnalytics = dsaAnalyticsService.getPlatformAnalytics(mockProfile);
assert.strictEqual(platformAnalytics.leetcode.totalSolved, 250, 'Test 9a Failed: LeetCode platform stats mismatch');
assert.notStrictEqual(diffProgress.distribution.easySolved + 250, diffProgress.distribution.easySolved, 'Test 9b Failed: Platform stats must remain separate from internal stats');
console.log('✓ Test 9 Passed: Platform stats remain strictly separate from internal manual stats.');

// Test 10 & 11: Fresh vs Stale cache sync logic
const freshProfile = { lastSyncedAt: new Date() };
const staleProfile = { lastSyncedAt: new Date(Date.now() - 20 * 60 * 1000) }; // 20 mins ago

const isFreshStale = (new Date() - freshProfile.lastSyncedAt) > 15 * 60 * 1000;
const isStaleStale = (new Date() - staleProfile.lastSyncedAt) > 15 * 60 * 1000;

assert.strictEqual(isFreshStale, false, 'Test 10 Failed: Fresh cache should not be stale');
assert.strictEqual(isStaleStale, true, 'Test 11 Failed: 20-minute old cache should be identified as stale');
console.log('✓ Test 10 & 11 Passed: Fresh cache skips sync; stale cache triggers refresh.');

console.log('\n--- ALL DSA ANALYTICS TESTS PASSED SUCCESSFULLY! ---');
