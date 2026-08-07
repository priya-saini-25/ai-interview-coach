const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getProblem,
  solveProblem,
  toggleRevision,
  updateProgressStatus,
  addTopic,
  completeTopic,
  getAllTopics,
  getStats,
} = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/dsa/recommendations
// @access  Private
router.get('/recommendations', protect, getRecommendations);

// @route   GET /api/dsa/problems/:id
// @access  Private
router.get('/problems/:id', protect, getProblem);

// @route   PATCH /api/dsa/revision/:id
// @access  Private
router.patch('/revision/:id', protect, toggleRevision);

// @route   POST /api/dsa/solve/:id
// @route   PATCH /api/dsa/solve/:id
// @access  Private
router.post('/solve/:id', protect, solveProblem);
router.patch('/solve/:id', protect, solveProblem);

// @route   PATCH /api/dsa/progress/:id
// @access  Private
router.patch('/progress/:id', protect, updateProgressStatus);

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
