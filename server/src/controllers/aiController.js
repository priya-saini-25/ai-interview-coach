const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Notification = require('../models/Notification');
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
    const geminiRawResponse = await analyzeResumeWithGemini(rawText);

    // 6. Parse Gemini JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(geminiRawResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message, 'Raw Response:', geminiRawResponse);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response',
      });
    }

    // Validate expected structure of parsed response
    const isValidFormat =
      parsedAnalysis &&
      typeof parsedAnalysis.overallScore === 'number' &&
      Array.isArray(parsedAnalysis.strengths) &&
      Array.isArray(parsedAnalysis.weaknesses) &&
      Array.isArray(parsedAnalysis.missingSkills) &&
      Array.isArray(parsedAnalysis.atsSuggestions) &&
      Array.isArray(parsedAnalysis.improvementSuggestions);

    if (!isValidFormat) {
      console.error('Invalid AI response structure:', parsedAnalysis);
      return res.status(500).json({
        success: false,
        message: 'Invalid AI response format',
      });
    }

    // 7. Save / Upsert analysis into MongoDB
    const savedAnalysis = await ResumeAnalysis.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          resumeUrl: user.resume,
          rawText: rawText,
          overallScore: parsedAnalysis.overallScore,
          strengths: parsedAnalysis.strengths,
          weaknesses: parsedAnalysis.weaknesses,
          missingSkills: parsedAnalysis.missingSkills,
          atsSuggestions: parsedAnalysis.atsSuggestions,
          improvementSuggestions: parsedAnalysis.improvementSuggestions,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Create notification for resume analysis completion
    await Notification.create({
      user: user._id,
      title: 'Resume Analysis Completed',
      message: 'Your resume has been analyzed successfully.',
      type: 'resume',
    });

    // 8. Return response with analysis fields only
    return res.status(200).json({
      success: true,
      analysis: {
        overallScore: savedAnalysis.overallScore,
        strengths: savedAnalysis.strengths,
        weaknesses: savedAnalysis.weaknesses,
        missingSkills: savedAnalysis.missingSkills,
        atsSuggestions: savedAnalysis.atsSuggestions,
        improvementSuggestions: savedAnalysis.improvementSuggestions,
      },
    });

  } catch (error) {
    console.error('Error in analyzeResume:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Resume analysis failed',
    });
  }
};
