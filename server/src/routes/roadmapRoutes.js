const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/roadmap/generate
// @access  Private
router.post('/generate', protect, generateRoadmap);

module.exports = router;
