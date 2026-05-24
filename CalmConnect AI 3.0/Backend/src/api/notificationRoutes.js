
const express = require('express');
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
// @access  Authenticated
router.get('/', auth, notificationController.getNotifications);

// @route   POST /api/notifications/check-reminders
// @desc    Check for upcoming appointment reminders
// @access  Authenticated
router.post('/check-reminders', auth, notificationController.checkReminders);

// @route   POST /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Authenticated
router.post('/:id/read', auth, notificationController.markAsRead);

// @route   POST /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Authenticated
router.post('/read-all', auth, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Authenticated
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
