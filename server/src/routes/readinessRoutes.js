const express = require('express');
const router = express.Router();
const { getReadinessScore } = require('../controllers/readinessController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/readiness
// @access  Private
router.get('/', protect, getReadinessScore);

module.exports = router;
