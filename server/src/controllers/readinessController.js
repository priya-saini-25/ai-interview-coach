const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Roadmap = require('../models/Roadmap');
const DsaProgress = require('../models/DsaProgress');
const dsaQuestionBank = require('../data/dsaQuestionBank');

/**
 * @desc    Get user's dynamic Placement Readiness Score
 * @route   GET /api/readiness
 * @access  Private
 */
exports.getReadinessScore = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    // Concurrently fetch user profile, latest resume analysis, roadmap, and DSA progress counts
    const [user, latestResumeAnalysis, roadmap, userDsaProgress] = await Promise.all([
      User.findById(userId),
      ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
      Roadmap.findOne({ user: userId }),
      DsaProgress.find({ user: userId }),
    ]);

    // Handle user not found case
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // 1. Calculate Profile Completion
    const profileFields = ['name', 'email', 'college', 'branch', 'graduationYear', 'skills', 'resume', 'targetRole'];
    let completedFieldsCount = 0;

    for (const field of profileFields) {
      const val = user[field];
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          if (val.length > 0) completedFieldsCount++;
        } else {
          completedFieldsCount++;
        }
      }
    }

    const profileCompletion = Math.round((completedFieldsCount / profileFields.length) * 100);

    // 2. Calculate Resume Score
    const resumeScore = latestResumeAnalysis && typeof latestResumeAnalysis.overallScore === 'number'
      ? latestResumeAnalysis.overallScore
      : 0;

    // 3. Calculate Roadmap Progress
    const roadmapProgress = roadmap ? 100 : 0;

    // 4. Calculate DSA Progress
    const solvedSet = new Set();
    userDsaProgress.forEach((p) => {
      if (p.completed || p.status === 'Solved') {
        solvedSet.add(p.problemId || p.topic.toLowerCase());
      }
    });

    const completedDsaTopics = solvedSet.size;
    const totalDsaTopics = Math.max(dsaQuestionBank.length, userDsaProgress.length);

    const dsaProgress = totalDsaTopics === 0
      ? 0
      : Math.round((completedDsaTopics / totalDsaTopics) * 100);

    // 5. Calculate Overall Score based on weights (Resume: 40%, DSA: 30%, Roadmap: 20%, Profile: 10%)
    const overallScore = Math.round(
      resumeScore * 0.4 +
      dsaProgress * 0.3 +
      roadmapProgress * 0.2 +
      profileCompletion * 0.1
    );

    // 6. Recommendation Logic
    let recommendation = '';
    if (overallScore < 40) {
      recommendation = 'Your placement readiness is low. Focus on completing your roadmap and strengthening your DSA fundamentals.';
    } else if (overallScore <= 70) {
      recommendation = 'Good progress. Improve your resume quality and solve more DSA problems.';
    } else {
      recommendation = 'You are placement ready. Continue mock interviews and company-specific preparation.';
    }

    return res.status(200).json({
      success: true,
      data: {
        overallScore,
        resumeScore,
        dsaProgress,
        roadmapProgress,
        profileCompletion,
        recommendation,
      },
    });
  } catch (error) {
    next(error);
  }
};
