const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
// @access  Private
router.get('/', protect, getNotifications);

// @route   PATCH /api/notifications/read/:id
// @access  Private
router.patch('/read/:id', protect, markAsRead);

// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, deleteNotification);

module.exports = router;
