const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Roadmap = require('../models/Roadmap');
const DsaProgress = require('../models/DsaProgress');
const InterviewSession = require('../models/InterviewSession');
const dsaQuestionBank = require('../data/dsaQuestionBank');

/**
 * Gathers a safe, compact placement context for a logged-in user to power the AI Mentor.
 * Filters out all private/sensitive info (passwords, tokens, API keys, credentials).
 *
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<Object>} - Compact placement context object.
 */
exports.getMentorContext = async (userId) => {
  try {
    const [user, resume, roadmap, userDsa, interviews] = await Promise.all([
      User.findById(userId).select('-password -profilePicturePublicId -resumePublicId'),
      ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
      Roadmap.findOne({ user: userId }).sort({ createdAt: -1 }),
      DsaProgress.find({ user: userId }),
      InterviewSession.find({ user: userId, completed: true }).sort({ createdAt: -1 }).limit(5),
    ]);

    // 1. Profile Context
    const profile = {
      name: user?.name || 'Candidate',
      targetRole: user?.targetRole || roadmap?.targetRole || '',
      targetCompany: user?.targetCompany || roadmap?.targetCompany || '',
      graduationYear: user?.graduationYear || '',
      college: user?.college || '',
      branch: user?.branch || '',
    };

    // 2. Resume Context
    const resumeContext = resume
      ? {
          hasResume: true,
          atsScore: resume.overallScore || 0,
          strengths: resume.strengths || [],
          weaknesses: resume.weaknesses || [],
          missingSkills: resume.missingSkills || [],
          improvementSuggestions: resume.improvementSuggestions || [],
        }
      : {
          hasResume: false,
          atsScore: 0,
          strengths: [],
          weaknesses: [],
          missingSkills: [],
          improvementSuggestions: [],
        };

    // 3. Roadmap Context
    const roadmapContext = {
      generated: !!roadmap,
      targetRole: roadmap?.targetRole || profile.targetRole,
      targetCompany: roadmap?.targetCompany || profile.targetCompany,
      targetPackage: roadmap?.targetPackage || '',
    };

    // 4. DSA Context
    const solvedSet = new Set();
    let savedForRevisionCount = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    userDsa.forEach((item) => {
      if (item.savedForRevision) {
        savedForRevisionCount++;
      }
      if (item.completed || item.status === 'Solved') {
        const key = item.problemId || item.topic.toLowerCase();
        if (!solvedSet.has(key)) {
          solvedSet.add(key);
          if (item.difficulty === 'Easy') easySolved++;
          else if (item.difficulty === 'Hard') hardSolved++;
          else mediumSolved++;
        }
      }
    });

    const totalBankCount = Math.max(dsaQuestionBank.length, userDsa.length);
    const solvedCount = solvedSet.size;
    const dsaCompletionPercentage = totalBankCount === 0 ? 0 : Math.round((solvedCount / totalBankCount) * 100);

    const dsaContext = {
      totalProblems: totalBankCount,
      solvedCount,
      completionPercentage: dsaCompletionPercentage,
      savedForRevisionCount,
      easySolved,
      mediumSolved,
      hardSolved,
    };

    // 5. Interview History Context
    const completedInterviewsCount = interviews.length;
    let averageInterviewScore = 0;
    if (completedInterviewsCount > 0) {
      const sumScore = interviews.reduce((acc, curr) => acc + (curr.score || 0), 0);
      averageInterviewScore = Math.round(sumScore / completedInterviewsCount);
    }

    const recentSessionsSummary = interviews.map((session) => ({
      role: session.role,
      company: session.company || 'General',
      difficulty: session.difficulty,
      score: session.score,
      feedbackHighlights: (session.feedback || []).slice(0, 2),
    }));

    const interviewContext = {
      completedSessionsCount: completedInterviewsCount,
      averageScore: averageInterviewScore,
      recentSessions: recentSessionsSummary,
    };

    // 6. Overall Placement Readiness Estimation
    // Weights: Resume (40%), DSA (30%), Roadmap (20%), Profile Completion (10%)
    let profileFieldsCount = 0;
    ['name', 'college', 'branch', 'graduationYear', 'targetRole'].forEach((f) => {
      if (user && user[f]) profileFieldsCount++;
    });
    const profileComp = Math.round((profileFieldsCount / 5) * 100);
    const roadmapProg = roadmap ? 100 : 0;

    const overallReadinessScore = Math.round(
      resumeContext.atsScore * 0.4 +
        dsaContext.completionPercentage * 0.3 +
        roadmapProg * 0.2 +
        profileComp * 0.1
    );

    return {
      profile,
      resume: resumeContext,
      roadmap: roadmapContext,
      dsa: dsaContext,
      interviews: interviewContext,
      readinessScore: overallReadinessScore,
    };
  } catch (error) {
    console.error('Error in getMentorContext:', error);
    return {
      profile: { name: 'Candidate', targetRole: '', targetCompany: '' },
      resume: { hasResume: false, atsScore: 0 },
      roadmap: { generated: false },
      dsa: { totalProblems: 35, solvedCount: 0, completionPercentage: 0 },
      interviews: { completedSessionsCount: 0, averageScore: 0 },
      readinessScore: 0,
    };
  }
};
