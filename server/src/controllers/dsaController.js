const DsaProgress = require('../models/DsaProgress');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const dsaQuestionBank = require('../data/dsaQuestionBank');
const dsaRecommendationService = require('../services/dsaRecommendationService');

/**
 * @desc    Get personalized DSA recommendations based on user's target role & company
 * @route   GET /api/dsa/recommendations
 * @access  Private
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    let { role, company, topic, difficulty, status } = req.query;

    // Fetch user profile
    const user = await User.findById(userId);
    let targetRole = role || user?.targetRole;
    let targetCompany = company || user?.targetCompany;

    // Fallback to latest user roadmap if role is missing in profile/query
    if (!targetRole) {
      const roadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
      if (roadmap?.targetRole) {
        targetRole = roadmap.targetRole;
        if (!targetCompany && roadmap.targetCompany) {
          targetCompany = roadmap.targetCompany;
        }
      }
    }

    // Fetch user's existing DSA progress
    const userProgress = await DsaProgress.find({ user: userId });

    const result = dsaRecommendationService.getRecommendedProblems(
      targetRole,
      targetCompany,
      userProgress,
      { topic, difficulty, status }
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get details for a single DSA problem by ID
 * @route   GET /api/dsa/problems/:id
 * @access  Private
 */
exports.getProblem = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const problemId = req.params.id;

    const problem = dsaRecommendationService.getProblemById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found.',
      });
    }

    // Check user progress for this problem
    const userProg = await DsaProgress.findOne({
      user: userId,
      $or: [{ problemId: problem.id }, { topic: problem.title }],
    });

    let status = 'Not Started';
    let solvedAt = null;
    let progressId = null;
    let savedForRevision = false;

    if (userProg) {
      progressId = userProg._id.toString();
      savedForRevision = !!userProg.savedForRevision;
      if (userProg.completed || userProg.status === 'Solved') {
        status = 'Solved';
        solvedAt = userProg.completedAt || userProg.updatedAt;
      } else if (userProg.status === 'In Progress') {
        status = 'In Progress';
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...problem,
        status,
        savedForRevision,
        solvedAt,
        progressId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or update Save for Revision status for a problem
 * @route   PATCH /api/dsa/revision/:id
 * @access  Private
 */
exports.toggleRevision = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const problemId = req.params.id;
    const { savedForRevision } = req.body;

    const problem = dsaRecommendationService.getProblemById(problemId);
    let topicTitle = problem ? problem.title : problemId;
    let topicCategory = problem ? problem.category : 'General';
    let topicDifficulty = problem ? problem.difficulty : 'Medium';

    let dsaProgress = await DsaProgress.findOne({
      user: userId,
      $or: [{ problemId: problemId }, { topic: topicTitle }],
    });

    if (dsaProgress) {
      dsaProgress.savedForRevision =
        savedForRevision !== undefined ? Boolean(savedForRevision) : !dsaProgress.savedForRevision;
      await dsaProgress.save();
    } else {
      dsaProgress = await DsaProgress.create({
        user: userId,
        problemId: problem ? problem.id : problemId,
        topic: topicTitle,
        category: topicCategory,
        difficulty: topicDifficulty,
        status: 'Not Started',
        completed: false,
        savedForRevision: savedForRevision !== undefined ? Boolean(savedForRevision) : true,
      });
    }

    return res.status(200).json({
      success: true,
      data: dsaProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a recommended problem as solved
 * @route   POST /api/dsa/solve/:id or PATCH /api/dsa/solve/:id
 * @access  Private
 */
exports.solveProblem = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const problemId = req.params.id;

    const problem = dsaRecommendationService.getProblemById(problemId);
    let topicTitle = problem ? problem.title : problemId;
    let topicCategory = problem ? problem.category : 'General';
    let topicDifficulty = problem ? problem.difficulty : 'Medium';

    // Check if progress entry already exists
    let dsaProgress = await DsaProgress.findOne({
      user: userId,
      $or: [{ problemId: problemId }, { topic: topicTitle }],
    });

    // Check if already completed/solved to avoid duplicate notifications & updates
    if (dsaProgress && (dsaProgress.completed || dsaProgress.status === 'Solved')) {
      return res.status(200).json({
        success: true,
        message: 'Problem already solved.',
        data: dsaProgress,
      });
    }

    if (dsaProgress) {
      dsaProgress.status = 'Solved';
      dsaProgress.completed = true;
      dsaProgress.completedAt = new Date();
      if (problem) dsaProgress.problemId = problem.id;
      await dsaProgress.save();
    } else {
      dsaProgress = await DsaProgress.create({
        user: userId,
        problemId: problem ? problem.id : problemId,
        topic: topicTitle,
        category: topicCategory,
        difficulty: topicDifficulty,
        status: 'Solved',
        completed: true,
        completedAt: new Date(),
      });
    }

    // Automatically create/update spaced repetition revision record
    try {
      await dsaRevisionService.createOrUpdateRevisionOnSolve(
        userId,
        problem ? problem.id : problemId,
        topicTitle,
        topicCategory,
        topicDifficulty
      );
    } catch (e) {
      console.warn('Failed to create spaced repetition revision:', e.message);
    }

    // Create notification for DSA problem completion
    await Notification.create({
      user: userId,
      title: 'DSA Progress Updated',
      message: `DSA problem completed: ${topicTitle}`,
      type: 'dsa',
    });

    return res.status(200).json({
      success: true,
      data: dsaProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update progress status for a problem (e.g. 'In Progress', 'Solved')
 * @route   PATCH /api/dsa/progress/:id
 * @access  Private
 */
exports.updateProgressStatus = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const problemId = req.params.id;
    const { status } = req.body;

    if (!['Not Started', 'In Progress', 'Solved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.',
      });
    }

    if (status === 'Solved') {
      return exports.solveProblem(req, res, next);
    }

    const problem = dsaRecommendationService.getProblemById(problemId);
    let topicTitle = problem ? problem.title : problemId;
    let topicCategory = problem ? problem.category : 'General';
    let topicDifficulty = problem ? problem.difficulty : 'Medium';

    let dsaProgress = await DsaProgress.findOne({
      user: userId,
      $or: [{ problemId: problemId }, { topic: topicTitle }],
    });

    if (dsaProgress) {
      dsaProgress.status = status;
      dsaProgress.completed = false;
      await dsaProgress.save();
    } else {
      dsaProgress = await DsaProgress.create({
        user: userId,
        problemId: problem ? problem.id : problemId,
        topic: topicTitle,
        category: topicCategory,
        difficulty: topicDifficulty,
        status,
        completed: false,
      });
    }

    return res.status(200).json({
      success: true,
      data: dsaProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new manual DSA topic to progress tracker (Backward compatibility)
 * @route   POST /api/dsa/add-topic
 * @access  Private
 */
exports.addTopic = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { topic, category, difficulty } = req.body;

    if (!topic || !category) {
      return res.status(400).json({
        success: false,
        message: 'Topic and category are required.',
      });
    }

    const dsaTopic = await DsaProgress.create({
      user: userId,
      topic,
      category,
      difficulty: difficulty || 'Medium',
      status: 'Not Started',
      completed: false,
    });

    await Notification.create({
      user: userId,
      title: 'DSA Progress Updated',
      message: `Your DSA progress has been updated successfully. Added "${topic}".`,
      type: 'dsa',
    });

    return res.status(201).json({
      success: true,
      data: dsaTopic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a DSA topic as completed by DsaProgress ID (Backward compatibility)
 * @route   PATCH /api/dsa/complete/:id
 * @access  Private
 */
exports.completeTopic = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const topicId = req.params.id;

    let dsaTopic = await DsaProgress.findById(topicId);

    // If not found by mongo ObjectId, try finding by problemId
    if (!dsaTopic) {
      req.params.id = topicId;
      return exports.solveProblem(req, res, next);
    }

    if (dsaTopic.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access.',
      });
    }

    if (dsaTopic.completed || dsaTopic.status === 'Solved') {
      return res.status(400).json({
        success: false,
        message: 'Topic already completed.',
      });
    }

    dsaTopic.completed = true;
    dsaTopic.status = 'Solved';
    dsaTopic.completedAt = new Date();

    const updatedTopic = await dsaTopic.save();

    await Notification.create({
      user: userId,
      title: 'DSA Progress Updated',
      message: `DSA problem completed: ${dsaTopic.topic}`,
      type: 'dsa',
    });

    return res.status(200).json({
      success: true,
      data: updatedTopic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all DSA topics for authenticated user (Backward compatibility)
 * @route   GET /api/dsa/topics
 * @access  Private
 */
exports.getAllTopics = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { category, difficulty, completed } = req.query;

    const filter = { user: userId };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (completed !== undefined) filter.completed = completed === 'true';

    const topics = await DsaProgress.find(filter).sort({ completed: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get DSA progress statistics for authenticated user
 * @route   GET /api/dsa/stats
 * @access  Private
 */
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const userProgress = await DsaProgress.find({ user: userId });
    
    // Total problems available in question bank
    const questionBankCount = dsaQuestionBank.length;

    // Solved problems count (both question bank and custom manual topics)
    const solvedSet = new Set();
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    userProgress.forEach((p) => {
      if (p.completed || p.status === 'Solved') {
        const key = p.problemId || p.topic.toLowerCase();
        if (!solvedSet.has(key)) {
          solvedSet.add(key);
          if (p.difficulty === 'Easy') easySolved++;
          else if (p.difficulty === 'Hard') hardSolved++;
          else mediumSolved++;
        }
      }
    });

    const completed = solvedSet.size;
    const total = Math.max(questionBankCount, userProgress.length);
    const pending = Math.max(0, total - completed);
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        completionPercentage,
        easy: easySolved,
        medium: mediumSolved,
        hard: hardSolved,
      },
    });
  } catch (error) {
    next(error);
  }
};

const PlatformProfile = require('../models/PlatformProfile');
const platformSyncService = require('../services/platformSyncService');

/**
 * @desc    Connect / update user competitive programming platform handles
 * @route   POST /api/dsa/platforms/connect
 * @access  Private
 */
exports.connectPlatforms = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { leetcode, codeforces, codechef, hackerrank } = req.body || {};

    let profile = await PlatformProfile.findOne({ user: userId });
    if (!profile) {
      profile = new PlatformProfile({ user: userId, handles: {}, stats: {} });
    }

    const updatedHandles = { ...profile.handles };

    // Validate and update only supplied handles
    const platforms = [
      { name: 'leetcode', val: leetcode },
      { name: 'codeforces', val: codeforces },
      { name: 'codechef', val: codechef },
      { name: 'hackerrank', val: hackerrank },
    ];

    for (const { name, val } of platforms) {
      if (val !== undefined && val !== null) {
        const trimmed = String(val).trim();
        if (trimmed !== '') {
          const isValid = platformSyncService.validatePlatformHandle(name, trimmed);
          if (!isValid) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${name} handle format. Usernames must be 3-30 alphanumeric characters.`,
            });
          }
          updatedHandles[name] = trimmed;
        } else {
          updatedHandles[name] = '';
        }
      }
    }

    profile.handles = updatedHandles;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Platform handles updated successfully.',
      data: {
        handles: profile.handles,
        stats: profile.stats,
        lastSyncedAt: profile.lastSyncedAt,
        lastSyncStatus: profile.lastSyncStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger sync for user's connected DSA platform profiles
 * @route   POST /api/dsa/platforms/sync
 * @access  Private
 */
exports.syncPlatforms = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const ignoreCooldown = req.query.ignoreCooldown === 'true';

    const syncResult = await platformSyncService.syncUserPlatforms(userId, { ignoreCooldown });

    return res.status(200).json({
      success: true,
      results: syncResult.results,
      profile: {
        handles: syncResult.profile.handles,
        stats: syncResult.profile.stats,
        lastSyncedAt: syncResult.profile.lastSyncedAt,
        lastSyncStatus: syncResult.profile.lastSyncStatus,
        lastSyncError: syncResult.profile.lastSyncError,
      },
    });
  } catch (error) {
    if (error.statusCode === 429 || error.isCooldown) {
      return res.status(429).json({
        success: false,
        message: error.message || 'Please wait before syncing again.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get user's connected platform handles and cached statistics
 * @route   GET /api/dsa/platforms
 * @access  Private
 */
exports.getPlatformProfiles = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    let profile = await PlatformProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          handles: { leetcode: '', codeforces: '', codechef: '', hackerrank: '' },
          stats: {
            leetcode: { totalSolved: 0, easy: 0, medium: 0, hard: 0 },
            codeforces: { rating: 0, rank: 'Unrated', totalSolved: 0, acceptedSubmissions: 0 },
            codechef: { rating: 0, stars: '1★', totalSolved: 0 },
            hackerrank: { badgeStars: 0, totalSolved: 0 },
          },
          lastSyncedAt: null,
          lastSyncStatus: 'Never Synced',
          lastSyncError: '',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        handles: profile.handles,
        stats: profile.stats,
        lastSyncedAt: profile.lastSyncedAt,
        lastSyncStatus: profile.lastSyncStatus,
        lastSyncError: profile.lastSyncError,
      },
    });
  } catch (error) {
    next(error);
  }
};

const dsaAnalyticsService = require('../services/dsaAnalyticsService');

/**
 * @desc    Get user's comprehensive DSA progress analytics
 * @route   GET /api/dsa/analytics
 * @access  Private
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const [user, userProgress] = await Promise.all([
      User.findById(userId).select('targetRole'),
      DsaProgress.find({ user: userId }),
    ]);

    const analytics = await dsaAnalyticsService.getDSAAnalytics(
      userId,
      userProgress,
      user?.targetRole || ''
    );

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

const DsaAIAnalysis = require('../models/DsaAIAnalysis');
const dsaAnalysisService = require('../services/ai/dsaAnalysisService');

/**
 * @desc    Get AI qualitative weakness analysis for user's DSA progress
 * @route   POST /api/dsa/ai-analysis
 * @access  Private
 */
exports.getAiAnalysis = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const [user, userProgress] = await Promise.all([
      User.findById(userId).select('targetRole'),
      DsaProgress.find({ user: userId }),
    ]);

    const analytics = await dsaAnalyticsService.getDSAAnalytics(
      userId,
      userProgress,
      user?.targetRole || ''
    );

    const snapshotHash = dsaAnalysisService.generateAnalyticsSnapshotHash(analytics);

    // 1. Check cache
    const cachedAnalysis = await DsaAIAnalysis.findOne({ user: userId });

    if (
      cachedAnalysis &&
      cachedAnalysis.analyticsSnapshotHash === snapshotHash &&
      cachedAnalysis.expiresAt &&
      new Date(cachedAnalysis.expiresAt) > new Date()
    ) {
      return res.status(200).json({
        success: true,
        data: cachedAnalysis.analysis,
        cached: true,
      });
    }

    // 2. Call Gemini for fresh qualitative analysis
    try {
      const aiResponse = await dsaAnalysisService.analyzeDSAWeaknessWithGemini(
        analytics,
        user?.targetRole || ''
      );

      // Save to cache (24 hours expiration)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await DsaAIAnalysis.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            user: userId,
            analyticsSnapshotHash: snapshotHash,
            analysis: aiResponse,
            generatedAt: new Date(),
            expiresAt,
          },
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        data: aiResponse,
        cached: false,
      });
    } catch (aiError) {
      console.warn('Gemini DSA AI analysis error, returning fallback:', aiError.message);
      return res.status(200).json({
        success: true,
        data: {
          aiAvailable: false,
          message: 'AI qualitative analysis is temporarily unavailable.',
          deterministicWeakTopics: analytics.weakTopics,
          summary: analytics.summary,
        },
      });
    }
    }
  } catch (error) {
    next(error);
  }
};

const DsaRoadmap = require('../models/DsaRoadmap');
const dsaRoadmapService = require('../services/dsaRoadmapService');

/**
 * @desc    Generate or retrieve user's personalized 7-Day DSA Roadmap
 * @route   POST /api/dsa/roadmap/generate
 * @access  Private
 */
exports.generateRoadmap = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const forceRegenerate = req.query.force === 'true';

    const [user, userProgress] = await Promise.all([
      User.findById(userId).select('targetRole'),
      DsaProgress.find({ user: userId }),
    ]);

    const analytics = await dsaAnalyticsService.getDSAAnalytics(
      userId,
      userProgress,
      user?.targetRole || ''
    );

    if (forceRegenerate) {
      await DsaRoadmap.updateMany({ user: userId, status: 'active' }, { $set: { status: 'expired' } });
    }

    const roadmap = await dsaRoadmapService.generateUser7DayRoadmap(
      userId,
      userProgress,
      analytics,
      user?.targetRole || ''
    );

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's active 7-Day DSA Roadmap
 * @route   GET /api/dsa/roadmap
 * @access  Private
 */
exports.getRoadmap = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    let roadmap = await DsaRoadmap.findOne({ user: userId, status: 'active' });

    if (!roadmap) {
      // Auto-generate if user does not have an active roadmap yet
      const [user, userProgress] = await Promise.all([
        User.findById(userId).select('targetRole'),
        DsaProgress.find({ user: userId }),
      ]);

      const analytics = await dsaAnalyticsService.getDSAAnalytics(
        userId,
        userProgress,
        user?.targetRole || ''
      );

      roadmap = await dsaRoadmapService.generateUser7DayRoadmap(
        userId,
        userProgress,
        analytics,
        user?.targetRole || ''
      );
    }

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a roadmap problem as completed or uncompleted
 * @route   PUT /api/dsa/roadmap/problem/:problemId
 * @access  Private
 */
exports.updateRoadmapProblem = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const problemId = req.params.problemId;
    const { completed = true } = req.body;

    const roadmap = await DsaRoadmap.findOne({ user: userId, status: 'active' });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'No active roadmap found.',
      });
    }

    let problemFound = false;

    roadmap.days.forEach((day) => {
      day.problems.forEach((p) => {
        if (p.problemId === problemId) {
          p.completed = Boolean(completed);
          p.completedAt = completed ? new Date() : null;
          problemFound = true;
        }
      });
    });

    if (!problemFound) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in current 7-day roadmap.',
      });
    }

    // Recalculate roadmap completion stats
    let total = 0;
    let done = 0;
    roadmap.days.forEach((day) => {
      day.problems.forEach((p) => {
        total++;
        if (p.completed) done++;
      });
    });

    roadmap.totalProblems = total;
    roadmap.completedProblems = done;
    roadmap.completionPercentage = total === 0 ? 0 : Math.round((done / total) * 100);

    if (done === total && total > 0) {
      roadmap.status = 'completed';
    }

    await roadmap.save();

    // Sync with global DsaProgress so manual tracking stays updated without duplicates
    if (completed) {
      const problem = dsaRecommendationService.getProblemById(problemId);
      let dsaProgress = await DsaProgress.findOne({
        user: userId,
        $or: [{ problemId: problemId }, { topic: problem ? problem.title : problemId }],
      });

      if (!dsaProgress) {
        await DsaProgress.create({
          user: userId,
          problemId: problemId,
          topic: problem ? problem.title : problemId,
          category: problem ? problem.category : 'General',
          difficulty: problem ? problem.difficulty : 'Medium',
          status: 'Solved',
          completed: true,
          completedAt: new Date(),
        });
      } else if (!dsaProgress.completed) {
        dsaProgress.status = 'Solved';
        dsaProgress.completed = true;
        dsaProgress.completedAt = new Date();
        await dsaProgress.save();
      }

      // Automatically sync spaced repetition revision record
      try {
        await dsaRevisionService.createOrUpdateRevisionOnSolve(
          userId,
          problemId,
          problem ? problem.title : problemId,
          problem ? problem.category : 'General',
          problem ? problem.difficulty : 'Medium'
        );
      } catch (e) {
        console.warn('Failed to create spaced repetition revision from roadmap:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: completed ? 'Roadmap problem marked as solved!' : 'Roadmap problem marked as uncompleted.',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

const dsaRevisionService = require('../services/dsaRevisionService');

/**
 * @desc    Get today's due, overdue, and upcoming spaced repetition revisions
 * @route   GET /api/dsa/revision/today
 * @access  Private
 */
exports.getDueRevisions = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const [user, userProgress] = await Promise.all([
      User.findById(userId).select('targetRole'),
      DsaProgress.find({ user: userId }),
    ]);

    const analytics = await dsaAnalyticsService.getDSAAnalytics(
      userId,
      userProgress,
      user?.targetRole || ''
    );

    const revisionsData = await dsaRevisionService.getDueToday(userId, analytics);

    return res.status(200).json({
      success: true,
      data: revisionsData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record outcome of a problem revision review (success/failure/skipped)
 * @route   POST /api/dsa/revision/:problemId/review
 * @access  Private
 */
exports.reviewProblem = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const problemId = req.params.problemId;
    const { result = 'success', difficultyRating = 3 } = req.body;

    const [user, userProgress] = await Promise.all([
      User.findById(userId).select('targetRole'),
      DsaProgress.find({ user: userId }),
    ]);

    const analytics = await dsaAnalyticsService.getDSAAnalytics(
      userId,
      userProgress,
      user?.targetRole || ''
    );

    const weakTopicNames = (analytics.weakTopics || []).map((w) => w.topic);

    const updatedRevision = await dsaRevisionService.recordReview(
      userId,
      problemId,
      result,
      difficultyRating,
      weakTopicNames
    );

    return res.status(200).json({
      success: true,
      message: `Revision result '${result}' recorded successfully.`,
      data: updatedRevision,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get spaced repetition revision statistics and streaks
 * @route   GET /api/dsa/revision/stats
 * @access  Private
 */
exports.getRevisionStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const stats = await dsaRevisionService.getRevisionStats(userId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get 30-day upcoming revision calendar
 * @route   GET /api/dsa/revision/upcoming
 * @access  Private
 */
exports.getUpcomingRevisionCalendar = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const days = parseInt(req.query.days, 10) || 30;

    const calendar = await dsaRevisionService.getUpcomingCalendar(userId, days);

    return res.status(200).json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    next(error);
  }
};





