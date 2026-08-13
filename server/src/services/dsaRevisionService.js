const DsaRevision = require('../models/DsaRevision');
const dsaQuestionBank = require('../data/dsaQuestionBank');

const REVISION_INTERVALS = [1, 3, 7, 14, 30]; // Days per level (0 to 4)

/**
 * Calculates deterministic priority score for a revision record.
 */
const calculatePriorityScore = (revision, weakTopicNames = []) => {
  if (!revision) return 0;

  const now = new Date();
  const dueDate = new Date(revision.dueDate);

  // 1. Weak Topic Bonus (+30 if topic matches candidate weak topics)
  const revTopic = (revision.topic || '').toLowerCase();
  const isWeak = weakTopicNames.some((wt) => {
    const normWt = (wt || '').toLowerCase();
    return revTopic.includes(normWt) || normWt.includes(revTopic);
  });
  const weakTopicBonus = isWeak ? 30 : 0;

  // 2. Failure Bonus (Higher priority for problems repeatedly failed)
  const failureCount = revision.failureCount || 0;
  const lastFailureBonus = revision.lastResult === 'failure' ? 20 : 0;
  const failureBonus = (failureCount * 15) + lastFailureBonus;

  // 3. Overdue Bonus (Higher priority for overdue items)
  let overdueBonus = 0;
  if (dueDate < now) {
    const diffMs = now.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    overdueBonus = Math.min(40, daysOverdue * 5);
  }

  // 4. Difficulty Bonus
  const diff = revision.difficulty || 'Medium';
  const difficultyBonus = diff === 'Hard' ? 15 : diff === 'Medium' ? 10 : 5;

  // 5. Rating Bonus (User-rated difficulty 1-5)
  const rating = revision.difficultyRating || 3;
  const ratingBonus = (6 - rating) * 5;

  return Math.min(100, weakTopicBonus + failureBonus + overdueBonus + difficultyBonus + ratingBonus);
};

/**
 * Ensures a DsaRevision record exists when a problem is marked solved.
 */
const createOrUpdateRevisionOnSolve = async (userId, problemId, topic, category, difficulty) => {
  let revision = await DsaRevision.findOne({ user: userId, problemId });

  const problemDetail = dsaQuestionBank.find((p) => p.id === problemId || p.slug === problemId);
  const resolvedTopic = category || topic || (problemDetail ? problemDetail.category || problemDetail.topic : 'General');
  const resolvedDiff = difficulty || (problemDetail ? problemDetail.difficulty : 'Medium');

  if (!revision) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    revision = await DsaRevision.create({
      user: userId,
      problemId,
      topic: resolvedTopic,
      difficulty: resolvedDiff,
      status: 'pending',
      revisionLevel: 0,
      intervalDays: 1,
      dueDate: tomorrow,
      priorityScore: 25,
    });
  } else {
    // If existing, ensure topic & difficulty stay populated
    revision.topic = resolvedTopic;
    revision.difficulty = resolvedDiff;
    await revision.save();
  }

  return revision;
};

/**
 * Records a revision review outcome (success, failure, skipped).
 */
const recordReview = async (userId, problemId, result, difficultyRating = 3, weakTopicNames = []) => {
  let revision = await DsaRevision.findOne({ user: userId, problemId });

  if (!revision) {
    const problemDetail = dsaQuestionBank.find((p) => p.id === problemId || p.slug === problemId);
    revision = await createOrUpdateRevisionOnSolve(
      userId,
      problemId,
      problemDetail ? problemDetail.topic : 'General',
      problemDetail ? problemDetail.category : 'General',
      problemDetail ? problemDetail.difficulty : 'Medium'
    );
  }

  const normResult = (result || 'success').toLowerCase();
  revision.reviewCount = (revision.reviewCount || 0) + 1;
  revision.lastReviewedAt = new Date();
  revision.lastResult = normResult;

  if (difficultyRating && difficultyRating >= 1 && difficultyRating <= 5) {
    revision.difficultyRating = Number(difficultyRating);
  }

  let level = revision.revisionLevel || 0;

  if (normResult === 'success') {
    revision.successCount = (revision.successCount || 0) + 1;
    level = Math.min(4, level + 1);
    revision.revisionLevel = level;
    revision.intervalDays = REVISION_INTERVALS[level];

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + revision.intervalDays);
    revision.dueDate = nextDue;
    revision.status = 'completed';
  } else if (normResult === 'failure') {
    revision.failureCount = (revision.failureCount || 0) + 1;
    level = Math.max(0, level - 1);
    revision.revisionLevel = level;
    revision.intervalDays = 1; // Reset interval to 1 day on failure

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 1);
    revision.dueDate = nextDue;
    revision.status = 'due';
  } else if (normResult === 'skipped') {
    revision.status = 'skipped';
  }

  // Recalculate priority score
  revision.priorityScore = calculatePriorityScore(revision, weakTopicNames);
  await revision.save();

  return revision;
};

/**
 * Gets problems due today, overdue, and upcoming.
 */
const getDueToday = async (userId, analytics = {}) => {
  const revisions = await DsaRevision.find({ user: userId });
  const weakTopicNames = (analytics.weakTopics || []).map((w) => w.topic);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const overdue = [];
  const dueToday = [];
  const upcoming = [];

  revisions.forEach((rev) => {
    // Dynamically enrich title from question bank if available
    const problemDetail = dsaQuestionBank.find((p) => p.id === rev.problemId || p.slug === rev.problemId);
    const title = problemDetail ? problemDetail.title : rev.problemId;
    const topic = problemDetail ? problemDetail.topic : rev.topic;
    const difficulty = problemDetail ? problemDetail.difficulty : rev.difficulty;

    const dueDate = new Date(rev.dueDate);
    const daysOverdue = dueDate < startOfToday ? Math.max(1, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))) : 0;
    const priorityScore = calculatePriorityScore(rev, weakTopicNames);

    const enriched = {
      _id: rev._id,
      problemId: rev.problemId,
      title,
      topic,
      difficulty,
      dueDate: rev.dueDate,
      daysOverdue,
      revisionLevel: rev.revisionLevel,
      intervalDays: rev.intervalDays,
      status: rev.status,
      lastReviewedAt: rev.lastReviewedAt,
      reviewCount: rev.reviewCount,
      successCount: rev.successCount,
      failureCount: rev.failureCount,
      lastResult: rev.lastResult,
      difficultyRating: rev.difficultyRating,
      priorityScore,
      successRate: rev.reviewCount === 0 ? 0 : Math.round((rev.successCount / rev.reviewCount) * 100),
    };

    if (dueDate < startOfToday) {
      overdue.push(enriched);
    } else if (dueDate >= startOfToday && dueDate <= endOfToday) {
      dueToday.push(enriched);
    } else {
      upcoming.push(enriched);
    }
  });

  // Sort by priorityScore descending
  overdue.sort((a, b) => b.priorityScore - a.priorityScore);
  dueToday.sort((a, b) => b.priorityScore - a.priorityScore);
  upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return {
    overdue,
    dueToday,
    upcoming,
  };
};

/**
 * Calculates revision statistics and revision streaks.
 */
const getRevisionStats = async (userId) => {
  const revisions = await DsaRevision.find({ user: userId });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  let totalRevisionProblems = revisions.length;
  let dueTodayCount = 0;
  let overdueCount = 0;
  let completedTodayCount = 0;
  let totalReviews = 0;
  let successfulReviews = 0;
  let failedReviews = 0;

  const successfulReviewDatesSet = new Set();

  revisions.forEach((rev) => {
    totalReviews += rev.reviewCount || 0;
    successfulReviews += rev.successCount || 0;
    failedReviews += rev.failureCount || 0;

    const dueDate = new Date(rev.dueDate);
    if (dueDate < startOfToday) overdueCount++;
    else if (dueDate >= startOfToday && dueDate <= endOfToday) dueTodayCount++;

    if (rev.lastReviewedAt) {
      const reviewDate = new Date(rev.lastReviewedAt);
      if (reviewDate >= startOfToday && reviewDate <= endOfToday && rev.lastResult === 'success') {
        completedTodayCount++;
      }
      if (rev.lastResult === 'success') {
        const dateStr = reviewDate.toISOString().split('T')[0];
        successfulReviewDatesSet.add(dateStr);
      }
    }
  });

  const successRate = totalReviews === 0 ? 0 : Math.round((successfulReviews / totalReviews) * 100);

  // Calculate revision streaks
  const sortedDates = Array.from(successfulReviewDatesSet).sort();
  let currentRevisionStreak = 0;
  let longestRevisionStreak = 0;

  if (sortedDates.length > 0) {
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    if (successfulReviewDatesSet.has(todayStr) || successfulReviewDatesSet.has(yesterdayStr)) {
      let checkDate = new Date();
      if (!successfulReviewDatesSet.has(todayStr)) checkDate = yesterdayDate;

      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (successfulReviewDatesSet.has(dStr)) {
          currentRevisionStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let tempStreak = 0;
    let prevDate = null;
    sortedDates.forEach((dStr) => {
      const curr = new Date(dStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffMs = curr.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) tempStreak++;
        else if (diffDays > 1) tempStreak = 1;
      }
      prevDate = curr;
      if (tempStreak > longestRevisionStreak) longestRevisionStreak = tempStreak;
    });
  }

  return {
    totalRevisionProblems,
    dueToday: dueTodayCount,
    overdue: overdueCount,
    completedToday: completedTodayCount,
    totalReviews,
    successfulReviews,
    failedReviews,
    successRate,
    currentRevisionStreak,
    longestRevisionStreak,
  };
};

/**
 * Groups upcoming revisions by date for the next 30 days calendar.
 */
const getUpcomingCalendar = async (userId, daysCount = 30) => {
  const revisions = await DsaRevision.find({ user: userId });

  const calendarMap = new Map();
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    calendarMap.set(dateStr, []);
  }

  revisions.forEach((rev) => {
    if (rev.dueDate) {
      const dateStr = new Date(rev.dueDate).toISOString().split('T')[0];
      if (calendarMap.has(dateStr)) {
        const problemDetail = dsaQuestionBank.find((p) => p.id === rev.problemId || p.slug === rev.problemId);
        calendarMap.get(dateStr).push({
          problemId: rev.problemId,
          title: problemDetail ? problemDetail.title : rev.problemId,
          topic: problemDetail ? problemDetail.topic : rev.topic,
          difficulty: problemDetail ? problemDetail.difficulty : rev.difficulty,
          revisionLevel: rev.revisionLevel,
        });
      }
    }
  });

  const result = Array.from(calendarMap.entries()).map(([date, problems]) => ({
    date,
    count: problems.length,
    problems,
  }));

  return result;
};

module.exports = {
  REVISION_INTERVALS,
  calculatePriorityScore,
  createOrUpdateRevisionOnSolve,
  recordReview,
  getDueToday,
  getRevisionStats,
  getUpcomingCalendar,
};
