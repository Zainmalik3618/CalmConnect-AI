
const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', auth, feedbackController.submitFeedback);
router.get('/', auth, adminAuth, feedbackController.getAllFeedback);

module.exports = router;
