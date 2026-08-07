const Roadmap = require('../models/Roadmap');
const Notification = require('../models/Notification');
const { generateRoadmapWithGemini } = require('../services/ai/geminiService');

/**
 * @desc    Get user's saved placement roadmap
 * @route   GET /api/roadmap
 * @access  Private
 */
exports.getRoadmap = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const roadmapData = await Roadmap.findOne({ user: userId });

    if (!roadmapData) {
      return res.status(200).json({
        success: true,
        roadmap: null,
      });
    }

    return res.status(200).json({
      success: true,
      roadmap: roadmapData.roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI Placement Roadmap
 * @route   POST /api/roadmap/generate
 * @access  Private
 */
exports.generateRoadmap = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { targetRole, targetCompany, currentYear, currentSkills, targetPackage } = req.body;

    // Validate required fields
    if (!userId || !targetRole || !targetCompany || !currentYear || !targetPackage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    // Call Gemini AI service
    let rawAiResponse;
    try {
      rawAiResponse = await generateRoadmapWithGemini({
        targetRole,
        targetCompany,
        currentYear,
        currentSkills,
        targetPackage,
      });
    } catch (aiError) {
      return res.status(500).json({
        success: false,
        message: aiError.message || 'Failed to generate roadmap from AI.',
      });
    }

    // Parse returned JSON from Gemini AI
    let parsedResponse;
    try {
      console.log('================ RAW GEMINI ROADMAP RESPONSE ================');
      console.log(rawAiResponse);
      console.log('=============================================================');
      parsedResponse = JSON.parse(rawAiResponse);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response. Invalid JSON format returned.',
      });
    }

    // Validate parsed roadmap structure
    if (!parsedResponse || !parsedResponse.roadmap || typeof parsedResponse.roadmap !== 'string') {
      return res.status(500).json({
        success: false,
        message: 'AI response missing valid roadmap content.',
      });
    }

    // Save or update user roadmap in MongoDB using findOneAndUpdate upsert
    const savedRoadmap = await Roadmap.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        targetRole,
        targetCompany,
        currentYear,
        currentSkills: currentSkills || [],
        targetPackage,
        roadmap: parsedResponse.roadmap,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    // Create notification for roadmap generation
    await Notification.create({
      user: userId,
      title: 'Roadmap Generated',
      message: 'Your personalized roadmap is ready.',
      type: 'roadmap',
    });

    return res.status(200).json({
      success: true,
      roadmap: savedRoadmap.roadmap,
    });
  } catch (error) {
    next(error);
  }
};
