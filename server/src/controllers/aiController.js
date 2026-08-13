const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Notification = require('../models/Notification');
const { extractTextFromPDF } = require('../services/ai/pdfExtractionService');
const { analyzeResumeWithGemini } = require('../services/ai/geminiService');
const { safeParseAIJson } = require('../utils/jsonUtils');
const {
  normalizeResumeText,
  calculateContentHash,
  calculateDeterministicAtsScore,
} = require('../utils/atsScorer');

// @desc    Get user's latest resume analysis
// @route   GET /api/ai/resume-analysis
// @access  Private
exports.getResumeAnalysis = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ user: req.user.userId }).sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(200).json({
        success: true,
        analysis: null,
      });
    }

    return res.status(200).json({
      success: true,
      analysis: {
        overallScore: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingSkills: analysis.missingSkills,
        atsSuggestions: analysis.atsSuggestions,
        improvementSuggestions: analysis.improvementSuggestions,
      },
    });
  } catch (error) {
    console.error('Error fetching resume analysis:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch resume analysis',
    });
  }
};

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

    // Normalize extracted text & calculate content hash and deterministic score
    const normalizedText = normalizeResumeText(rawText);
    const contentHash = calculateContentHash(normalizedText);
    const deterministicScore = calculateDeterministicAtsScore(rawText);

    // 5. Check if user already has an analysis with the exact same content hash
    const existingAnalysis = await ResumeAnalysis.findOne({ user: user._id });

    if (
      existingAnalysis &&
      existingAnalysis.contentHash === contentHash &&
      Array.isArray(existingAnalysis.strengths) &&
      existingAnalysis.strengths.length > 0
    ) {
      // Reuse existing qualitative feedback, ensure overallScore is deterministic
      existingAnalysis.overallScore = deterministicScore;
      existingAnalysis.resumeUrl = user.resume;
      await existingAnalysis.save();

      return res.status(200).json({
        success: true,
        analysis: {
          overallScore: existingAnalysis.overallScore,
          strengths: existingAnalysis.strengths,
          weaknesses: existingAnalysis.weaknesses,
          missingSkills: existingAnalysis.missingSkills,
          atsSuggestions: existingAnalysis.atsSuggestions,
          improvementSuggestions: existingAnalysis.improvementSuggestions,
        },
      });
    }

    // 6. Analyze extracted resume text with Gemini AI service for qualitative feedback
    const geminiRawResponse = await analyzeResumeWithGemini(rawText);

    // Parse Gemini JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = safeParseAIJson(geminiRawResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      return res.status(502).json({
        success: false,
        message: 'Failed to parse AI response',
      });
    }

    // Validate expected structure of parsed qualitative response
    const isValidFormat =
      parsedAnalysis &&
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

    // 7. Save / Upsert analysis into MongoDB using the deterministic ATS score
    const savedAnalysis = await ResumeAnalysis.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          resumeUrl: user.resume,
          rawText: rawText,
          contentHash: contentHash,
          overallScore: deterministicScore,
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
