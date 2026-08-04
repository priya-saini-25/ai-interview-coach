const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, uploadMiddleware, updateUserProfile);

module.exports = router;
