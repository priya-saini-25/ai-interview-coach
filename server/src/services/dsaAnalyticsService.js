const dsaQuestionBank = require('../data/dsaQuestionBank');
const PlatformProfile = require('../models/PlatformProfile');
const DsaProgress = require('../models/DsaProgress');
const platformSyncService = require('./platformSyncService');

/**
 * Calculates topic-wise progress across curated question bank + user custom topics.
 */
const getTopicProgress = (userProgress = []) => {
  // Map of user progress by problemId or topic name (lowercased)
  const progressMap = new Map();
  userProgress.forEach((p) => {
    const key = (p.problemId || p.topic || '').toLowerCase();
    if (key) progressMap.set(key, p);
  });

  // Group problems by topic
  const topicStats = new Map();

  // Helper to ensure topic exists in map
  const getOrCreateTopic = (topicName) => {
    if (!topicStats.has(topicName)) {
      topicStats.set(topicName, {
        topic: topicName,
        total: 0,
        solved: 0,
        inProgress: 0,
        remaining: 0,
        completionPercentage: 0,
      });
    }
    return topicStats.get(topicName);
  };

  // Process curated question bank
  dsaQuestionBank.forEach((problem) => {
    const topicName = problem.category || problem.topic;
    const topicObj = getOrCreateTopic(topicName);
    topicObj.total++;

    const key = (problem.id || problem.title || '').toLowerCase();
    const userProg = progressMap.get(key) || progressMap.get(problem.title.toLowerCase());

    if (userProg) {
      if (userProg.completed || userProg.status === 'Solved') {
        topicObj.solved++;
      } else if (userProg.status === 'In Progress') {
        topicObj.inProgress++;
      }
    }
  });

  // Process custom topics not in curated bank
  userProgress.forEach((p) => {
    const isCustom = !p.problemId && p.topic;
    if (isCustom) {
      const topicObj = getOrCreateTopic(p.category || p.topic);
      topicObj.total++;
      if (p.completed || p.status === 'Solved') {
        topicObj.solved++;
      } else if (p.status === 'In Progress') {
        topicObj.inProgress++;
      }
    }
  });

  // Calculate percentages & remaining
  const result = Array.from(topicStats.values()).map((t) => {
    t.remaining = Math.max(0, t.total - t.solved);
    t.completionPercentage = t.total === 0 ? 0 : Math.round((t.solved / t.total) * 100);
    return t;
  });

  // Sort topics by completion percentage ascending (weakest first)
  result.sort((a, b) => a.completionPercentage - b.completionPercentage);

  return result;
};

/**
 * Calculates difficulty progress breakdown for Easy, Medium, Hard.
 */
const getDifficultyProgress = (userProgress = []) => {
  const diffMap = {
    Easy: { solved: 0, total: 0, completionPercentage: 0 },
    Medium: { solved: 0, total: 0, completionPercentage: 0 },
    Hard: { solved: 0, total: 0, completionPercentage: 0 },
  };

  // Count total in question bank
  dsaQuestionBank.forEach((p) => {
    const diff = p.difficulty || 'Medium';
    if (diffMap[diff]) diffMap[diff].total++;
  });

  // Count user solved / custom
  const solvedKeys = new Set();
  userProgress.forEach((p) => {
    const diff = p.difficulty || 'Medium';

    if (p.completed || p.status === 'Solved') {
      const key = (p.problemId || p.topic || '').toLowerCase();
      if (!solvedKeys.has(key)) {
        solvedKeys.add(key);
        if (diffMap[diff]) {
          diffMap[diff].solved++;
        }
      }
    }

    // If custom topic with difficulty, add to total if not in bank
    if (!p.problemId && p.topic && diffMap[diff]) {
      diffMap[diff].total++;
    }
  });

  ['Easy', 'Medium', 'Hard'].forEach((d) => {
    const obj = diffMap[d];
    obj.completionPercentage = obj.total === 0 ? 0 : Math.round((obj.solved / obj.total) * 100);
  });

  return {
    easy: diffMap.Easy,
    medium: diffMap.Medium,
    hard: diffMap.Hard,
    distribution: {
      easySolved: diffMap.Easy.solved,
      mediumSolved: diffMap.Medium.solved,
      hardSolved: diffMap.Hard.solved,
    },
  };
};

/**
 * Calculates weekly progress (7-day breakdown: past 7 days up to today).
 */
const getWeeklyProgress = (userProgress = []) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  // Create array for past 7 days
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];
    past7Days.push({ date: dateStr, day: dayLabel, solved: 0 });
  }

  const dateMap = new Map(past7Days.map((item) => [item.date, item]));

  userProgress.forEach((p) => {
    if (p.completed || p.status === 'Solved') {
      const solveDate = p.completedAt || p.updatedAt;
      if (solveDate) {
        const dateStr = new Date(solveDate).toISOString().split('T')[0];
        if (dateMap.has(dateStr)) {
          dateMap.get(dateStr).solved++;
        }
      }
    }
  });

  return past7Days;
};

/**
 * Calculates monthly progress (week-wise buckets for the current month).
 */
const getMonthlyProgress = (userProgress = []) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const weekBuckets = [
    { week: 1, label: 'Week 1 (Days 1-7)', solved: 0 },
    { week: 2, label: 'Week 2 (Days 8-14)', solved: 0 },
    { week: 3, label: 'Week 3 (Days 15-21)', solved: 0 },
    { week: 4, label: 'Week 4 (Days 22-28)', solved: 0 },
    { week: 5, label: 'Week 5 (Days 29+)', solved: 0 },
  ];

  userProgress.forEach((p) => {
    if (p.completed || p.status === 'Solved') {
      const solveDate = p.completedAt || p.updatedAt;
      if (solveDate) {
        const d = new Date(solveDate);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          const day = d.getDate();
          if (day <= 7) weekBuckets[0].solved++;
          else if (day <= 14) weekBuckets[1].solved++;
          else if (day <= 21) weekBuckets[2].solved++;
          else if (day <= 28) weekBuckets[3].solved++;
          else weekBuckets[4].solved++;
        }
      }
    }
  });

  // Filter out week 5 if day < 29
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  if (daysInMonth < 29) {
    return weekBuckets.slice(0, 4);
  }

  return weekBuckets;
};

/**
 * Calculates active streak and longest streak.
 */
const getStreak = (userProgress = []) => {
  const solvedDatesSet = new Set();

  userProgress.forEach((p) => {
    if (p.completed || p.status === 'Solved') {
      const solveDate = p.completedAt || p.updatedAt;
      if (solveDate) {
        const dateStr = new Date(solveDate).toISOString().split('T')[0];
        solvedDatesSet.add(dateStr);
      }
    }
  });

  if (solvedDatesSet.size === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSolvedDate: null,
    };
  }

  const sortedDates = Array.from(solvedDatesSet).sort();
  const lastSolvedDate = sortedDates[sortedDates.length - 1];

  // Calculate current active streak
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = new Date();

  // If today or yesterday has activity, streak is alive
  if (solvedDatesSet.has(todayStr) || solvedDatesSet.has(yesterdayStr)) {
    if (!solvedDatesSet.has(todayStr)) {
      checkDate = yesterdayDate;
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (solvedDatesSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all time
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  sortedDates.forEach((dStr) => {
    const curr = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = curr.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = curr;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  });

  return {
    currentStreak,
    longestStreak,
    lastSolvedDate,
  };
};

/**
 * Deterministic weak topic detection.
 */
const getWeakTopics = (userProgress = [], targetRole = '') => {
  const topicProgress = getTopicProgress(userProgress);

  const weakTopics = [];

  topicProgress.forEach((t) => {
    const reasons = [];
    let weaknessScore = 100 - t.completionPercentage; // Base score from uncompleted %

    // Reason 1: Low completion percentage (< 40%)
    if (t.completionPercentage < 40) {
      reasons.push(`Low completion rate (${t.completionPercentage}%)`);
      weaknessScore += 20;
    }

    // Reason 2: Low solved count
    if (t.solved <= 1 && t.total > 2) {
      reasons.push(`Only ${t.solved} problem(s) solved out of ${t.total}`);
      weaknessScore += 15;
    }

    // Reason 3: Topic priority for target role
    const roleNorm = (targetRole || '').toLowerCase();
    if (roleNorm.includes('backend') && ['trees', 'graphs', 'dynamic programming', 'binary search'].includes(t.topic.toLowerCase())) {
      reasons.push('High priority for Backend engineering roles');
      weaknessScore += 25;
    } else if (roleNorm.includes('frontend') && ['arrays', 'strings', 'hashing', 'two pointers'].includes(t.topic.toLowerCase())) {
      reasons.push('High priority for Frontend development roles');
      weaknessScore += 25;
    } else if (['arrays', 'dynamic programming', 'graphs'].includes(t.topic.toLowerCase())) {
      reasons.push('Core high-frequency interview topic');
      weaknessScore += 10;
    }

    if (reasons.length > 0 && t.completionPercentage < 70) {
      weakTopics.push({
        topic: t.topic,
        score: Math.min(100, weaknessScore),
        completionPercentage: t.completionPercentage,
        solved: t.solved,
        total: t.total,
        reasons,
      });
    }
  });

  // Sort weak topics by weakness score descending
  weakTopics.sort((a, b) => b.score - a.score);

  return weakTopics.slice(0, 5); // Return top 5 weak topics
};

/**
 * Formats platform analytics separately from internal stats.
 */
const getPlatformAnalytics = (platformProfile) => {
  const result = {
    leetcode: { connected: false },
    codeforces: { connected: false },
    codechef: { connected: false },
    hackerrank: { connected: false },
  };

  if (!platformProfile) return result;

  const handles = platformProfile.handles || {};
  const stats = platformProfile.stats || {};
  const lastSyncedAt = platformProfile.lastSyncedAt;

  if (handles.leetcode) {
    result.leetcode = {
      connected: true,
      handle: handles.leetcode,
      totalSolved: stats.leetcode?.totalSolved || 0,
      easy: stats.leetcode?.easy || 0,
      medium: stats.leetcode?.medium || 0,
      hard: stats.leetcode?.hard || 0,
      lastSyncedAt,
    };
  }

  if (handles.codeforces) {
    result.codeforces = {
      connected: true,
      handle: handles.codeforces,
      rating: stats.codeforces?.rating || 0,
      rank: stats.codeforces?.rank || 'Unrated',
      totalSolved: stats.codeforces?.totalSolved || 0,
      acceptedSubmissions: stats.codeforces?.acceptedSubmissions || 0,
      lastSyncedAt,
    };
  }

  if (handles.codechef) {
    result.codechef = {
      connected: true,
      handle: handles.codechef,
      rating: stats.codechef?.rating || 0,
      stars: stats.codechef?.stars || '1★',
      totalSolved: stats.codechef?.totalSolved || 0,
      lastSyncedAt,
    };
  }

  if (handles.hackerrank) {
    result.hackerrank = {
      connected: true,
      handle: handles.hackerrank,
      badgeStars: stats.hackerrank?.badgeStars || 0,
      totalSolved: stats.hackerrank?.totalSolved || 0,
      lastSyncedAt,
    };
  }

  return result;
};

/**
 * Main DSA Analytics Entry Point with automatic stale sync logic.
 */
const getDSAAnalytics = async (userId, userProgress = [], targetRole = '') => {
  let platformProfile = await PlatformProfile.findOne({ user: userId });

  // Stale sync check (trigger sync if connected handles exist and lastSyncedAt is older than 15 mins)
  if (platformProfile) {
    const hasConnectedHandles = Object.values(platformProfile.handles || {}).some((h) => h && h.trim() !== '');
    if (hasConnectedHandles) {
      const isStale = !platformProfile.lastSyncedAt || (Date.now() - new Date(platformProfile.lastSyncedAt).getTime() > platformSyncService.SYNC_COOLDOWN_MS);
      if (isStale) {
        try {
          await platformSyncService.syncUserPlatforms(userId, { ignoreCooldown: true });
          platformProfile = await PlatformProfile.findOne({ user: userId });
        } catch (e) {
          // Gracefully continue using cached profile if sync attempt encounters an error
        }
      }
    }
  }

  const topicProgress = getTopicProgress(userProgress);
  const difficultyProgress = getDifficultyProgress(userProgress);
  const weeklyProgress = getWeeklyProgress(userProgress);
  const monthlyProgress = getMonthlyProgress(userProgress);
  const streak = getStreak(userProgress);
  const weakTopics = getWeakTopics(userProgress, targetRole);
  const platforms = getPlatformAnalytics(platformProfile);

  // Overall internal summary
  const totalTracked = Math.max(dsaQuestionBank.length, userProgress.length);
  const solvedCount = difficultyProgress.distribution.easySolved + difficultyProgress.distribution.mediumSolved + difficultyProgress.distribution.hardSolved;
  const pendingCount = Math.max(0, totalTracked - solvedCount);
  const completionPercentage = totalTracked === 0 ? 0 : Math.round((solvedCount / totalTracked) * 100);

  const solvedThisWeek = weeklyProgress.reduce((sum, item) => sum + item.solved, 0);
  const solvedThisMonth = monthlyProgress.reduce((sum, item) => sum + item.solved, 0);

  const summary = {
    totalTracked,
    solved: solvedCount,
    pending: pendingCount,
    easySolved: difficultyProgress.distribution.easySolved,
    mediumSolved: difficultyProgress.distribution.mediumSolved,
    hardSolved: difficultyProgress.distribution.hardSolved,
    completionPercentage,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    solvedThisWeek,
    solvedThisMonth,
  };

  const DsaRevision = require('../models/DsaRevision');
  let revisionSummary = {
    dueToday: 0,
    overdue: 0,
    revisionCompletionPercentage: 0,
    revisionSuccessRate: 0,
    currentRevisionStreak: 0,
  };

  try {
    const revisions = await DsaRevision.find({ user: userId });
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let dueTodayCount = 0;
    let overdueCount = 0;
    let completedTodayCount = 0;
    let totalReviews = 0;
    let successReviews = 0;

    revisions.forEach((rev) => {
      const dueDate = new Date(rev.dueDate);
      if (dueDate < startOfToday) overdueCount++;
      else if (dueDate >= startOfToday && dueDate <= endOfToday) dueTodayCount++;

      totalReviews += rev.reviewCount || 0;
      successReviews += rev.successCount || 0;

      if (rev.lastReviewedAt) {
        const reviewDate = new Date(rev.lastReviewedAt);
        if (reviewDate >= startOfToday && reviewDate <= endOfToday && rev.lastResult === 'success') {
          completedTodayCount++;
        }
      }
    });

    const totalDue = dueTodayCount + overdueCount + completedTodayCount;
    revisionSummary = {
      dueToday: dueTodayCount,
      overdue: overdueCount,
      revisionCompletionPercentage: totalDue === 0 ? 100 : Math.round((completedTodayCount / totalDue) * 100),
      revisionSuccessRate: totalReviews === 0 ? 0 : Math.round((successReviews / totalReviews) * 100),
      currentRevisionStreak: streak.currentStreak,
    };
  } catch (e) {
    // Continue cleanly if revisions collection is not queried
  }

  return {
    summary,
    topicProgress,
    difficultyProgress,
    weeklyProgress,
    monthlyProgress,
    streak,
    weakTopics,
    platforms,
    revisionSummary,
  };
};

module.exports = {
  getTopicProgress,
  getDifficultyProgress,
  getWeeklyProgress,
  getMonthlyProgress,
  getStreak,
  getWeakTopics,
  getPlatformAnalytics,
  getDSAAnalytics,
};
