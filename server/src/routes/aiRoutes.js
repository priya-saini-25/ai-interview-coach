const express = require('express');
const router = express.Router();
const { analyzeResume, getResumeAnalysis } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/ai/resume-analysis
// @access  Private
router.get('/resume-analysis', protect, getResumeAnalysis);

// @route   POST /api/ai/analyze-resume
// @access  Private
router.post('/analyze-resume', protect, analyzeResume);

module.exports = router;
