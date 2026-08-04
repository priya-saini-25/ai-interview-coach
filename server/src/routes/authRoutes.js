const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, uploadResume } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const uploadResumeMiddleware = require('../middleware/uploadResumeMiddleware');

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

// @route   PUT /api/auth/resume
// @access  Private
router.put('/resume', protect, uploadResumeMiddleware, uploadResume);

module.exports = router;
