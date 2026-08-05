const express = require('express');
const router = express.Router();
const { addTopic, completeTopic, getAllTopics, getStats } = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/dsa/add-topic
// @access  Private
router.post('/add-topic', protect, addTopic);

// @route   PATCH /api/dsa/complete/:id
// @access  Private
router.patch('/complete/:id', protect, completeTopic);

// @route   GET /api/dsa/topics
// @access  Private
router.get('/topics', protect, getAllTopics);

// @route   GET /api/dsa/stats
// @access  Private
router.get('/stats', protect, getStats);

module.exports = router;
