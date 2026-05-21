const express = require('express');
const moodController = require('../controllers/moodController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/mood
// @desc    Get all mood entries for the logged-in user
// @access  Private
router.get('/', auth, moodController.getMoodEntries);

// @route   POST api/mood
// @desc    Add a new mood entry for the logged-in user
// @access  Private
router.post('/', auth, moodController.addMoodEntry);

module.exports = router;
