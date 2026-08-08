const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, getDashboardSummary);

module.exports = router;
