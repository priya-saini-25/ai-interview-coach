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
  connectPlatforms,
  syncPlatforms,
  getPlatformProfiles,
  getAnalytics,
  getAiAnalysis,
  generateRoadmap,
  getRoadmap,
  updateRoadmapProblem,
  getDueRevisions,
  reviewProblem,
  getRevisionStats,
  getUpcomingRevisionCalendar,
} = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/dsa/revision/today
// @access  Private
router.get('/revision/today', protect, getDueRevisions);

// @route   POST /api/dsa/revision/:problemId/review
// @access  Private
router.post('/revision/:problemId/review', protect, reviewProblem);

// @route   GET /api/dsa/revision/stats
// @access  Private
router.get('/revision/stats', protect, getRevisionStats);

// @route   GET /api/dsa/revision/upcoming
// @access  Private
router.get('/revision/upcoming', protect, getUpcomingRevisionCalendar);

// @route   POST /api/dsa/roadmap/generate
// @access  Private
router.post('/roadmap/generate', protect, generateRoadmap);

// @route   GET /api/dsa/roadmap
// @access  Private
router.get('/roadmap', protect, getRoadmap);

// @route   PUT /api/dsa/roadmap/problem/:problemId
// @access  Private
router.put('/roadmap/problem/:problemId', protect, updateRoadmapProblem);

// @route   POST /api/dsa/ai-analysis
// @access  Private
router.post('/ai-analysis', protect, getAiAnalysis);

// @route   GET /api/dsa/analytics
// @access  Private
router.get('/analytics', protect, getAnalytics);

// @route   POST /api/dsa/platforms/connect
// @access  Private
router.post('/platforms/connect', protect, connectPlatforms);

// @route   POST /api/dsa/platforms/sync
// @access  Private
router.post('/platforms/sync', protect, syncPlatforms);

// @route   GET /api/dsa/platforms
// @access  Private
router.get('/platforms', protect, getPlatformProfiles);

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
