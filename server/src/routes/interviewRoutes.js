const express = require('express');
const router = express.Router();
const { startInterview, submitInterview, getInterviewHistory } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/interview/start
// @access  Private
router.post('/start', protect, startInterview);

// @route   POST /api/interview/submit/:sessionId
// @access  Private
router.post('/submit/:sessionId', protect, submitInterview);

// @route   GET /api/interview/history
// @access  Private
router.get('/history', protect, getInterviewHistory);

module.exports = router;
