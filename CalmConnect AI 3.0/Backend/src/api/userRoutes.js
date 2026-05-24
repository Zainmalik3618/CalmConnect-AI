

const express = require('express');
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (for contacts list, admin)
// @access  Authenticated
router.get('/', auth, userController.getAllUsers);


// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Authenticated
router.get('/me', auth, userController.getCurrentUser);

// @route   PUT /api/users/me
// @desc    Update current user's profile
// @access  Authenticated
router.put('/me', auth, userController.updateCurrentUser);

// @route   POST /api/users/me/request-deletion
// @desc    User requests account deletion
// @access  Authenticated
router.post('/me/request-deletion', auth, userController.requestAccountDeletion);


// --- Admin Routes ---

// @route   POST /api/users/psychiatrist
// @desc    Admin adds a new psychiatrist
// @access  Admin
router.post('/psychiatrist', auth, adminAuth, userController.addPsychiatrist);

// @route   PUT /api/users/:id/status
// @desc    Admin updates a user's status (block/unblock)
// @access  Admin
router.put('/:id/status', auth, adminAuth, userController.updateUserStatus);

// @route   POST /api/users/:id/reject-deletion
// @desc    Admin rejects a user's account deletion request
// @access  Admin
router.post('/:id/reject-deletion', auth, adminAuth, userController.rejectAccountDeletion);

// @route   DELETE /api/users/:id
// @desc    Admin deletes a user
// @access  Admin
router.delete('/:id', auth, adminAuth, userController.deleteUser);

// @route   GET /api/users/activity-logs
// @desc    Admin gets user activity logs
// @access  Admin
router.get('/activity-logs', auth, adminAuth, userController.getActivityLogs);


module.exports = router;