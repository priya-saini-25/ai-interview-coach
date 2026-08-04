const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/ai/analyze-resume
// @access  Private
router.post('/analyze-resume', protect, analyzeResume);

module.exports = router;
