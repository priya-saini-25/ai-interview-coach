const DsaProgress = require('../models/DsaProgress');
const Notification = require('../models/Notification');

/**
 * @desc    Add a new DSA topic to progress tracker
 * @route   POST /api/dsa/add-topic
 * @access  Private
 */
exports.addTopic = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { topic, category, difficulty } = req.body;

    // Validate required fields
    if (!topic || !category) {
      return res.status(400).json({
        success: false,
        message: 'Topic and category are required.',
      });
    }

    // Create a new DSA progress document
    const dsaTopic = await DsaProgress.create({
      user: userId,
      topic,
      category,
      difficulty: difficulty || 'Medium',
      completed: false,
    });

    // Create notification for adding DSA topic
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
 * @desc    Mark a DSA topic as completed
 * @route   PATCH /api/dsa/complete/:id
 * @access  Private
 */
exports.completeTopic = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const topicId = req.params.id;

    // Find the DSA topic by ID
    const dsaTopic = await DsaProgress.findById(topicId);

    // Check if topic exists
    if (!dsaTopic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.',
      });
    }

    // Verify topic belongs to the authenticated user
    if (dsaTopic.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access.',
      });
    }

    // Check if already completed
    if (dsaTopic.completed) {
      return res.status(400).json({
        success: false,
        message: 'Topic already completed.',
      });
    }

    // Update topic to completed
    dsaTopic.completed = true;
    dsaTopic.completedAt = new Date();

    const updatedTopic = await dsaTopic.save();

    // Create notification for DSA topic completion
    await Notification.create({
      user: userId,
      title: 'DSA Progress Updated',
      message: `Your DSA progress has been updated successfully. Completed "${dsaTopic.topic}".`,
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
 * @desc    Get all DSA topics for authenticated user with optional filters & sorting
 * @route   GET /api/dsa/topics
 * @access  Private
 */
exports.getAllTopics = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { category, difficulty, completed } = req.query;

    const filter = { user: userId };

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    // Sort: pending topics first (completed: false), completed topics after, then newest first within each group
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

    const [total, completed, pending, easy, medium, hard] = await Promise.all([
      DsaProgress.countDocuments({ user: userId }),
      DsaProgress.countDocuments({ user: userId, completed: true }),
      DsaProgress.countDocuments({ user: userId, completed: false }),
      DsaProgress.countDocuments({ user: userId, difficulty: 'Easy' }),
      DsaProgress.countDocuments({ user: userId, difficulty: 'Medium' }),
      DsaProgress.countDocuments({ user: userId, difficulty: 'Hard' }),
    ]);

    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        completionPercentage,
        easy,
        medium,
        hard,
      },
    });
  } catch (error) {
    next(error);
  }
};
