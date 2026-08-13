const PlatformProfile = require('../models/PlatformProfile');
const leetCodeSync = require('./platformSync/leetCodeSync');
const codeforcesSync = require('./platformSync/codeforcesSync');
const codeChefSync = require('./platformSync/codeChefSync');
const hackerRankSync = require('./platformSync/hackerRankSync');

const SYNC_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown

/**
 * Validates a handle format for a specific platform.
 */
const validatePlatformHandle = (platform, handle) => {
  if (!handle || typeof handle !== 'string') return false;
  const p = (platform || '').toLowerCase();

  if (p === 'leetcode') return leetCodeSync.validateHandle(handle);
  if (p === 'codeforces') return codeforcesSync.validateHandle(handle);
  if (p === 'codechef') return codeChefSync.validateHandle(handle);
  if (p === 'hackerrank') return hackerRankSync.validateHandle(handle);

  return false;
};

/**
 * Executes sync for a single platform by name.
 */
const syncSinglePlatform = async (platform, handle) => {
  const p = (platform || '').toLowerCase();

  if (p === 'leetcode') return await leetCodeSync.fetchLeetCodeStats(handle);
  if (p === 'codeforces') return await codeforcesSync.fetchCodeforcesStats(handle);
  if (p === 'codechef') return await codeChefSync.fetchCodeChefStats(handle);
  if (p === 'hackerrank') return await hackerRankSync.fetchHackerRankStats(handle);

  return {
    success: false,
    platform: p,
    handle,
    message: `Unsupported platform '${platform}'.`,
  };
};

/**
 * Syncs all connected handles for a given user.
 */
const syncUserPlatforms = async (userId, options = {}) => {
  const { ignoreCooldown = false } = options;

  let profile = await PlatformProfile.findOne({ user: userId });

  if (!profile) {
    profile = await PlatformProfile.create({
      user: userId,
      handles: {},
      stats: {},
    });
  }

  // Check 15-minute cooldown
  if (!ignoreCooldown && profile.lastSyncedAt) {
    const elapsed = Date.now() - new Date(profile.lastSyncedAt).getTime();
    if (elapsed < SYNC_COOLDOWN_MS) {
      const remainingMinutes = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / (60 * 1000));
      const error = new Error(`Please wait ${remainingMinutes} minutes before syncing again.`);
      error.statusCode = 429;
      error.isCooldown = true;
      throw error;
    }
  }

  const activePlatforms = [];
  const { leetcode, codeforces, codechef, hackerrank } = profile.handles || {};

  if (leetcode) activePlatforms.push({ name: 'leetcode', handle: leetcode });
  if (codeforces) activePlatforms.push({ name: 'codeforces', handle: codeforces });
  if (codechef) activePlatforms.push({ name: 'codechef', handle: codechef });
  if (hackerrank) activePlatforms.push({ name: 'hackerrank', handle: hackerrank });

  if (activePlatforms.length === 0) {
    profile.lastSyncStatus = 'Never Synced';
    profile.lastSyncError = 'No connected platform handles found.';
    await profile.save();
    return {
      success: true,
      message: 'No platform handles connected.',
      results: [],
      profile,
    };
  }

  // Run all platform syncs concurrently using Promise.allSettled
  const syncPromises = activePlatforms.map(({ name, handle }) =>
    syncSinglePlatform(name, handle)
  );

  const settledResults = await Promise.allSettled(syncPromises);

  const results = [];
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  settledResults.forEach((settled, idx) => {
    const platformName = activePlatforms[idx].name;

    if (settled.status === 'fulfilled' && settled.value && settled.value.success) {
      const platformData = settled.value;
      successCount++;

      // Update stored stats for successful platform
      if (!profile.stats) profile.stats = {};
      profile.stats[platformName] = {
        ...profile.stats[platformName],
        ...platformData.stats,
      };

      results.push({
        platform: platformName,
        success: true,
        stats: platformData.stats,
      });
    } else {
      failCount++;
      const errMsg = settled.status === 'fulfilled'
        ? (settled.value?.message || 'Sync failed')
        : (settled.reason?.message || 'Unexpected sync error');

      errors.push(`${platformName}: ${errMsg}`);

      results.push({
        platform: platformName,
        success: false,
        message: errMsg,
      });
    }
  });

  // Determine overall sync status
  if (successCount > 0 && failCount === 0) {
    profile.lastSyncStatus = 'Success';
    profile.lastSyncError = '';
  } else if (successCount > 0 && failCount > 0) {
    profile.lastSyncStatus = 'Partial Failure';
    profile.lastSyncError = errors.join('; ');
  } else {
    profile.lastSyncStatus = 'Failed';
    profile.lastSyncError = errors.join('; ') || 'All platform sync attempts failed.';
  }

  profile.lastSyncedAt = new Date();
  await profile.save();

  return {
    success: true,
    results,
    profile,
  };
};

module.exports = {
  validatePlatformHandle,
  syncSinglePlatform,
  syncUserPlatforms,
  SYNC_COOLDOWN_MS,
};
