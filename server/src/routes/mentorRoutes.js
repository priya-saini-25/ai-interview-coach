const express = require('express');
const router = express.Router();
const { postChatMessage, getChatHistory, clearChatHistory } = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/mentor/chat
// @access  Private
router.post('/chat', protect, postChatMessage);

// @route   GET /api/mentor/history
// @access  Private
router.get('/history', protect, getChatHistory);

// @route   DELETE /api/mentor/history
// @access  Private
router.delete('/history', protect, clearChatHistory);

module.exports = router;
