const Roadmap = require('../models/Roadmap');
const Notification = require('../models/Notification');
const { generateRoadmapWithGemini } = require('../services/ai/geminiService');
const { safeParseAIJson } = require('../utils/jsonUtils');

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
      targetRole: roadmapData.targetRole,
      targetCompany: roadmapData.targetCompany,
      currentYear: roadmapData.currentYear,
      currentSkills: roadmapData.currentSkills,
      targetPackage: roadmapData.targetPackage,
      updatedAt: roadmapData.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Explicitly save or update user's placement roadmap
 * @route   POST /api/roadmap/save
 * @access  Private
 */
exports.saveRoadmap = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { targetRole, targetCompany, currentYear, currentSkills, targetPackage, roadmap } = req.body;

    if (!userId || !roadmap) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap content is required to save.',
      });
    }

    const savedRoadmap = await Roadmap.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        targetRole: targetRole || 'Software Development Engineer',
        targetCompany: targetCompany || 'Tech Company',
        currentYear: currentYear || '3rd Year',
        currentSkills: Array.isArray(currentSkills) ? currentSkills : [],
        targetPackage: targetPackage || '20 LPA',
        roadmap,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      roadmap: savedRoadmap.roadmap,
      targetRole: savedRoadmap.targetRole,
      targetCompany: savedRoadmap.targetCompany,
      currentYear: savedRoadmap.currentYear,
      currentSkills: savedRoadmap.currentSkills,
      targetPackage: savedRoadmap.targetPackage,
      updatedAt: savedRoadmap.updatedAt,
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
      parsedResponse = safeParseAIJson(rawAiResponse);
    } catch (parseError) {
      console.error('Roadmap JSON Parse Error:', parseError.message);
      return res.status(502).json({
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
