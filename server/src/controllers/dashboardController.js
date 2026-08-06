const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Roadmap = require('../models/Roadmap');
const DsaProgress = require('../models/DsaProgress');

/**
 * @desc    Get Dashboard Summary
 * @route   GET /api/dashboard
 * @access  Private
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    // Concurrently fetch user profile, latest resume analysis, roadmap, and DSA counts
    const [user, latestResumeAnalysis, roadmap, totalDsaTopics, completedDsaTopics] = await Promise.all([
      User.findById(userId),
      ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
      Roadmap.findOne({ user: userId }),
      DsaProgress.countDocuments({ user: userId }),
      DsaProgress.countDocuments({ user: userId, completed: true }),
    ]);

    // Return 404 if user is not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prepare resume data
    const resumeData = latestResumeAnalysis
      ? {
          uploaded: true,
          score: latestResumeAnalysis.overallScore || 0,
        }
      : {
          uploaded: false,
          score: 0,
        };

    // Prepare roadmap data
    const roadmapData = {
      generated: !!roadmap,
    };

    // Prepare DSA data
    const pendingDsa = totalDsaTopics > 0 ? totalDsaTopics - completedDsaTopics : 0;
    const completionPercentage = totalDsaTopics === 0 ? 0 : Math.round((completedDsaTopics / totalDsaTopics) * 100);

    const dsaData = {
      total: totalDsaTopics,
      completed: completedDsaTopics,
      pending: pendingDsa,
      completionPercentage,
    };

    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name || '',
          email: user.email || '',
          college: user.college || '',
          branch: user.branch || '',
          graduationYear: user.graduationYear || '',
        },
        resume: resumeData,
        roadmap: roadmapData,
        dsa: dsaData,
      },
    });
  } catch (error) {
    next(error);
  }
};
