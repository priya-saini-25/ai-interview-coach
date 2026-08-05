const express = require('express');
const router = express.Router();
const { addTopic, completeTopic } = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/dsa/add-topic
// @access  Private
router.post('/add-topic', protect, addTopic);

// @route   PATCH /api/dsa/complete/:id
// @access  Private
router.patch('/complete/:id', protect, completeTopic);

module.exports = router;
