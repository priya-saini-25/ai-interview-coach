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
