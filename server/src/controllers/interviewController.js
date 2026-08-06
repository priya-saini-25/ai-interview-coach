const InterviewSession = require('../models/InterviewSession');
const Notification = require('../models/Notification');
const { generateInterviewQuestions, evaluateInterviewAnswers } = require('../services/ai/geminiService');

/**
 * @desc    Start a new AI interview session and generate questions
 * @route   POST /api/interview/start
 * @access  Private
 */
exports.startInterview = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { role, difficulty, company } = req.body;

    // Validate required input
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a role for the interview.',
      });
    }

    // Call Gemini AI service to generate questions
    let rawAiResponse;
    try {
      rawAiResponse = await generateInterviewQuestions({
        role,
        difficulty: difficulty || 'Medium',
        company: company || '',
      });
    } catch (aiError) {
      return res.status(500).json({
        success: false,
        message: aiError.message || 'Failed to generate interview questions from AI.',
      });
    }

    // Parse returned JSON from Gemini AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawAiResponse);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response. Invalid JSON format returned.',
      });
    }

    // Validate parsed questions structure
    if (!parsedResponse || !Array.isArray(parsedResponse.questions) || parsedResponse.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI response missing valid interview questions.',
      });
    }

    // Create and save new InterviewSession in MongoDB
    const session = await InterviewSession.create({
      user: userId,
      role,
      difficulty: difficulty || 'Medium',
      company: company || '',
      questions: parsedResponse.questions,
    });

    return res.status(201).json({
      success: true,
      sessionId: session._id,
      questions: session.questions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answers for an interview session and get AI feedback & score
 * @route   POST /api/interview/submit/:sessionId
 * @access  Private
 */
exports.submitInterview = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;
    const { answers } = req.body;

    // Validate input answers
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of answers.',
      });
    }

    // Load interview session from MongoDB
    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Verify session belongs to the authenticated user
    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this interview session.',
      });
    }

    // Send questions + candidate answers to Gemini AI for evaluation
    let rawAiResponse;
    try {
      rawAiResponse = await evaluateInterviewAnswers({
        role: session.role,
        difficulty: session.difficulty,
        company: session.company,
        questions: session.questions,
        answers,
      });
    } catch (aiError) {
      return res.status(500).json({
        success: false,
        message: aiError.message || 'Failed to evaluate interview answers via AI.',
      });
    }

    // Parse returned JSON from Gemini AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawAiResponse);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI evaluation response. Invalid JSON format returned.',
      });
    }

    // Update interview session with score, feedback, and completed status
    session.score = typeof parsedResponse.score === 'number' ? parsedResponse.score : 0;
    session.feedback = Array.isArray(parsedResponse.feedback) ? parsedResponse.feedback : [];
    session.completed = true;

    await session.save();

    // Create notification for interview submission completion
    await Notification.create({
      user: userId,
      title: 'Interview Feedback Ready',
      message: 'Your AI interview evaluation is ready.',
      type: 'interview',
    });

    return res.status(200).json({
      success: true,
      score: session.score,
      feedback: session.feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all interview sessions for logged in user sorted by newest first
 * @route   GET /api/interview/history
 * @access  Private
 */
exports.getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const sessions = await InterviewSession.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};
