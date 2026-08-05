const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { extractTextFromPDF } = require('../services/ai/pdfExtractionService');

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

    // 5. Upsert the ResumeAnalysis document
    // If one exists for this user, update it. Otherwise, create a new one.
    await ResumeAnalysis.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          resumeUrl: user.resume,
          rawText: rawText
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    // 6. Return success with the first 1000 characters
    return res.status(200).json({
      success: true,
      message: 'Resume text extracted successfully.',
      text: rawText.slice(0, 1000),
    });

  } catch (error) {
    // Log the internal error for debugging but do not expose to the client
    console.error('Error in analyzeResume:', error.message);

    return res.status(500).json({
      success: false,
      message: 'PDF extraction failed',
    });
  }
};

