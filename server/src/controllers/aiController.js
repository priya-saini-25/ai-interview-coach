const User = require('../models/User');
const { extractTextFromPDF } = require('../services/ai/pdfExtractionService');
const { analyzeResumeWithGemini } = require('../services/ai/geminiService');

// @desc    Analyze user resume
// @route   POST /api/ai/analyze-resume
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    // 1. Fetch the user and their resume URL
    const user = await User.findById(req.user.userId).select('resume');

    // 2. Verify the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 3. Verify the user has uploaded a resume
    if (!user.resume) {
      return res.status(400).json({
        success: false,
        message: 'No resume uploaded. Please upload a resume first.',
      });
    }

    // 4. Extract text from the PDF via the AI service layer
    const rawText = await extractTextFromPDF(user.resume);

    // 5. Analyze extracted resume text with Gemini AI service
    const result = await analyzeResumeWithGemini(rawText);

    // 6. Return response with Gemini AI output
    return res.status(200).json({
      success: true,
      geminiResponse: result,
    });

  } catch (error) {
    // Log the internal error for debugging
    console.error('Error in analyzeResume:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Resume analysis failed',
    });
  }
};


