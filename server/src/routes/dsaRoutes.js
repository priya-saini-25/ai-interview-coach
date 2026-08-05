const express = require('express');
const router = express.Router();
const { addTopic } = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/dsa/add-topic
// @access  Private
router.post('/add-topic', protect, addTopic);

module.exports = router;
