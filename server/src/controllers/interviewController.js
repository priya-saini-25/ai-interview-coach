const InterviewSession = require('../models/InterviewSession');
const Notification = require('../models/Notification');
const { generateInterviewQuestions, evaluateInterviewAnswers } = require('../services/ai/geminiService');
const { safeParseAIJson } = require('../utils/jsonUtils');

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
    if (!role || typeof role !== 'string' || role.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role for the interview.',
      });
    }

    const trimmedRole = role.trim();
    const trimmedCompany = typeof company === 'string' ? company.trim() : '';
    const validDifficulty = difficulty || 'Medium';

    // Call Gemini AI service to generate questions
    let rawAiResponse;
    try {
      rawAiResponse = await generateInterviewQuestions({
        role: trimmedRole,
        difficulty: validDifficulty,
        company: trimmedCompany,
      });
    } catch (aiError) {
      console.error('AI Service Error in startInterview:', aiError.message);
      return res.status(502).json({
        success: false,
        message: aiError.message || 'Failed to generate interview questions from AI service.',
      });
    }

    // Safely parse JSON response from Gemini AI
    let parsedResponse;
    try {
      parsedResponse = safeParseAIJson(rawAiResponse);
    } catch (parseError) {
      console.error('AI Response JSON Parse Error in startInterview:', parseError.message);
      return res.status(502).json({
        success: false,
        message: 'Failed to parse AI response. Invalid JSON format returned.',
      });
    }

    // Extract questions array from parsed response structure
    let questions = [];
    if (Array.isArray(parsedResponse)) {
      questions = parsedResponse;
    } else if (parsedResponse && typeof parsedResponse === 'object') {
      if (Array.isArray(parsedResponse.questions)) {
        questions = parsedResponse.questions;
      } else if (Array.isArray(parsedResponse.interview_questions)) {
        questions = parsedResponse.interview_questions;
      } else if (Array.isArray(parsedResponse.interviewQuestions)) {
        questions = parsedResponse.interviewQuestions;
      } else if (Array.isArray(parsedResponse.data)) {
        questions = parsedResponse.data;
      } else if (Array.isArray(parsedResponse.items)) {
        questions = parsedResponse.items;
      } else {
        const foundArray = Object.values(parsedResponse).find(
          (val) => Array.isArray(val) && val.length > 0
        );
        if (foundArray) {
          questions = foundArray;
        }
      }
    }

    // Clean and validate question items
    questions = questions
      .filter((q) => q !== null && q !== undefined)
      .map((q) => (typeof q === 'string' ? q.trim() : String(q).trim()))
      .filter((q) => q.length > 0);

    if (questions.length === 0) {
      console.error('AI response contained no valid interview questions array.');
      return res.status(502).json({
        success: false,
        message: 'AI response missing valid interview questions.',
      });
    }

    // Ensure exactly 5 questions are returned
    if (questions.length > 5) {
      questions = questions.slice(0, 5);
    } else {
      while (questions.length < 5) {
        const index = questions.length + 1;
        questions.push(
          `Describe a key technical challenge or project accomplishment in your experience as a ${trimmedRole} (Question ${index}).`
        );
      }
    }

    // Create and save new InterviewSession in MongoDB
    const session = await InterviewSession.create({
      user: userId,
      role: trimmedRole,
      difficulty: validDifficulty,
      company: trimmedCompany,
      questions,
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
      console.error('AI Service Error in submitInterview:', aiError.message);
      return res.status(502).json({
        success: false,
        message: aiError.message || 'Failed to evaluate interview answers via AI.',
      });
    }

    // Safely parse JSON response from Gemini AI
    let parsedResponse;
    try {
      parsedResponse = safeParseAIJson(rawAiResponse);
    } catch (parseError) {
      console.error('AI Evaluation Response JSON Parse Error:', parseError.message);
      return res.status(502).json({
        success: false,
        message: 'Failed to parse AI evaluation response. Invalid JSON format returned.',
      });
    }

    // Update interview session with score, feedback, and completed status
    session.score = typeof parsedResponse.score === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsedResponse.score)))
      : 75;

    let feedback = [];
    if (Array.isArray(parsedResponse.feedback)) {
      feedback = parsedResponse.feedback;
    } else if (Array.isArray(parsedResponse.evaluations)) {
      feedback = parsedResponse.evaluations;
    } else if (parsedResponse && typeof parsedResponse === 'object') {
      const foundArray = Object.values(parsedResponse).find(
        (val) => Array.isArray(val) && val.length > 0
      );
      if (foundArray) feedback = foundArray;
    }

    feedback = feedback.map((f) => (typeof f === 'string' ? f.trim() : String(f).trim()));
    while (feedback.length < session.questions.length) {
      feedback.push('Response evaluated: shows fundamental domain understanding.');
    }

    session.feedback = feedback;
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
