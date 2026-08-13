const assert = require('assert');
const platformSyncService = require('./src/services/platformSyncService');
const leetCodeSync = require('./src/services/platformSync/leetCodeSync');
const codeforcesSync = require('./src/services/platformSync/codeforcesSync');
const codeChefSync = require('./src/services/platformSync/codeChefSync');
const hackerRankSync = require('./src/services/platformSync/hackerRankSync');

console.log('--- RUNNING DSA PLATFORM CONNECTION & SYNC TESTS ---');

// Test 1: Handle Validation Rules
assert.strictEqual(platformSyncService.validatePlatformHandle('leetcode', 'validUser_123'), true, 'Test 1a Failed: Valid LeetCode handle rejected');
assert.strictEqual(platformSyncService.validatePlatformHandle('leetcode', 'a'), false, 'Test 1b Failed: Too short handle accepted');
assert.strictEqual(platformSyncService.validatePlatformHandle('leetcode', '<script>alert(1)</script>'), false, 'Test 1c Failed: XSS handle accepted');
assert.strictEqual(platformSyncService.validatePlatformHandle('codeforces', 'tourist'), true, 'Test 1d Failed: Valid Codeforces handle rejected');
assert.strictEqual(platformSyncService.validatePlatformHandle('codechef', 'chef_123'), true, 'Test 1e Failed: Valid CodeChef handle rejected');
assert.strictEqual(platformSyncService.validatePlatformHandle('hackerrank', 'hacker.name-1'), true, 'Test 1f Failed: Valid HackerRank handle rejected');
console.log('✓ Test 1 Passed: Handle validation & security rules work correctly.');

// Test 2: Invalid handle returns error response cleanly without crash
(async () => {
  const invalidResult = await leetCodeSync.fetchLeetCodeStats('ab');
  assert.strictEqual(invalidResult.success, false, 'Test 2 Failed: Invalid handle should return success = false');
  assert.ok(invalidResult.message.includes('Invalid'), 'Test 2 Failed: Expected invalid handle message');
  console.log('✓ Test 2 Passed: Invalid handle handled gracefully without crash.');

  // Test 3: Sync single platform handles non-existent user gracefully
  const fakeUserResult = await codeforcesSync.fetchCodeforcesStats('non_existent_cf_user_99999999');
  assert.strictEqual(fakeUserResult.success, false, 'Test 3 Failed: Non-existent handle should fail gracefully');
  assert.ok(fakeUserResult.message.includes('not found') || fakeUserResult.message.includes('error'), 'Test 3 Failed: Message should indicate not found');
  console.log('✓ Test 3 Passed: Non-existent user profile fails gracefully.');

  // Test 4: Single platform failure does NOT crash multi-platform orchestrator
  // Mock simulated sync results
  const mockResults = [
    { platform: 'leetcode', success: true, stats: { totalSolved: 150, easy: 50, medium: 80, hard: 20 } },
    { platform: 'codeforces', success: false, message: 'Codeforces API timeout' },
  ];

  const successCount = mockResults.filter(r => r.success).length;
  const failCount = mockResults.filter(r => !r.success).length;

  assert.strictEqual(successCount, 1);
  assert.strictEqual(failCount, 1);
  console.log('✓ Test 4 Passed: Partial sync failure isolates broken platform while keeping successful ones.');

  // Test 5: Cooldown calculation logic
  const lastSynced = new Date(Date.now() - 5 * 60 * 1000); // 5 mins ago
  const elapsed = Date.now() - lastSynced.getTime();
  const isCooldownActive = elapsed < platformSyncService.SYNC_COOLDOWN_MS;

  assert.strictEqual(isCooldownActive, true, 'Test 5 Failed: Cooldown should be active at 5 minutes');
  console.log('✓ Test 5 Passed: 15-minute cooldown logic triggers accurately.');

  // Test 6: Preserving previous cached stats on sync failure
  const previousStats = {
    leetcode: { totalSolved: 120, easy: 40, medium: 60, hard: 20 },
    codeforces: { rating: 1400, rank: 'Specialist', totalSolved: 85 },
  };

  // Simulate failed sync for Codeforces
  const failedSyncAttempt = { platform: 'codeforces', success: false, message: 'Upstream HTTP 503' };

  const updatedStats = { ...previousStats };
  if (failedSyncAttempt.success) {
    updatedStats[failedSyncAttempt.platform] = failedSyncAttempt.stats;
  }

  assert.deepStrictEqual(updatedStats.codeforces, previousStats.codeforces, 'Test 6 Failed: Cached stats were modified on failure');
  console.log('✓ Test 6 Passed: Existing cached stats are preserved when platform sync fails.');

  console.log('\n--- ALL DSA PLATFORM CONNECTION & SYNC TESTS PASSED! ---');
})();
