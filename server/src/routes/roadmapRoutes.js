const express = require('express');
const router = express.Router();
const { generateRoadmap, getRoadmap, saveRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/roadmap
// @access  Private
router.get('/', protect, getRoadmap);

// @route   POST /api/roadmap/generate
// @access  Private
router.post('/generate', protect, generateRoadmap);

// @route   POST /api/roadmap/save
// @access  Private
router.post('/save', protect, saveRoadmap);

module.exports = router;
