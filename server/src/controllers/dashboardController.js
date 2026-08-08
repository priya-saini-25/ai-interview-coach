const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Roadmap = require('../models/Roadmap');
const DsaProgress = require('../models/DsaProgress');
const dsaQuestionBank = require('../data/dsaQuestionBank');

/**
 * @desc    Get Dashboard Summary
 * @route   GET /api/dashboard
 * @access  Private
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    // Concurrently fetch user profile, latest resume analysis, roadmap, and DSA counts
    const [user, latestResumeAnalysis, roadmap, userDsaProgress] = await Promise.all([
      User.findById(userId),
      ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
      Roadmap.findOne({ user: userId }),
      DsaProgress.find({ user: userId }),
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

    // Count unique solved problems (question bank + manual custom)
    const solvedSet = new Set();
    userDsaProgress.forEach((p) => {
      if (p.completed || p.status === 'Solved') {
        solvedSet.add(p.problemId || p.topic.toLowerCase());
      }
    });

    const completedDsa = solvedSet.size;
    const totalDsaTopics = Math.max(dsaQuestionBank.length, userDsaProgress.length);
    const pendingDsa = Math.max(0, totalDsaTopics - completedDsa);
    const completionPercentage = totalDsaTopics === 0 ? 0 : Math.round((completedDsa / totalDsaTopics) * 100);

    const dsaData = {
      total: totalDsaTopics,
      completed: completedDsa,
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
          targetRole: user.targetRole || '',
          targetCompany: user.targetCompany || '',
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
