const Notification = require('../models/Notification');

/**
 * @desc    Get all notifications for logged in user sorted by newest first
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/read/:id
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Verify ownership
    if (notification.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this notification',
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification belonging to logged in user
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Verify ownership
    if (notification.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this notification',
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
