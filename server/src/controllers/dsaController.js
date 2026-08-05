const DsaProgress = require('../models/DsaProgress');

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

    return res.status(200).json({
      success: true,
      data: updatedTopic,
    });
  } catch (error) {
    next(error);
  }
};
