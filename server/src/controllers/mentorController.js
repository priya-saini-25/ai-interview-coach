const MentorConversation = require('../models/MentorConversation');
const { getMentorContext } = require('../services/mentorContextService');
const { chatWithMentorWithGemini } = require('../services/ai/geminiService');

/**
 * @desc    Send a message to the AI Placement Mentor
 * @route   POST /api/mentor/chat
 * @access  Private
 */
exports.postChatMessage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required and cannot be empty.',
      });
    }

    const sanitizedMessage = message.trim();

    // 1. Gather Candidate Context
    const userContext = await getMentorContext(userId);

    // 2. Fetch or initialize conversation history
    let conversation = await MentorConversation.findOne({ user: userId });
    if (!conversation) {
      conversation = new MentorConversation({
        user: userId,
        messages: [],
      });
    }

    // Pass last 10 messages for conversation continuity
    const recentMessages = conversation.messages.slice(-10);

    // 3. Request AI Mentor response from Gemini
    const replyText = await chatWithMentorWithGemini({
      userContext,
      chatHistory: recentMessages,
      userMessage: sanitizedMessage,
    });

    // 4. Save new user message and assistant reply to database
    conversation.messages.push({
      role: 'user',
      content: sanitizedMessage,
      createdAt: new Date(),
    });

    conversation.messages.push({
      role: 'assistant',
      content: replyText,
      createdAt: new Date(),
    });

    await conversation.save();

    return res.status(200).json({
      success: true,
      reply: replyText,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error('Error in AI Mentor chat endpoint:', error);

    const isRateLimitOrQuota =
      error.message?.includes('429') ||
      error.message?.includes('quota') ||
      error.message?.includes('rate limit');

    if (isRateLimitOrQuota) {
      return res.status(429).json({
        success: false,
        message: 'AI Mentor is currently busy due to high demand. Please try again in a few moments.',
      });
    }

    return res.status(502).json({
      success: false,
      message: 'Unable to reach the AI Mentor right now. Please try again later.',
    });
  }
};

/**
 * @desc    Get candidate's stored AI Mentor conversation history
 * @route   GET /api/mentor/history
 * @access  Private
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const conversation = await MentorConversation.findOne({ user: userId });

    return res.status(200).json({
      success: true,
      data: conversation ? conversation.messages : [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear candidate's AI Mentor conversation history
 * @route   DELETE /api/mentor/history
 * @access  Private
 */
exports.clearChatHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    await MentorConversation.findOneAndUpdate(
      { user: userId },
      { $set: { messages: [] } }
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};
