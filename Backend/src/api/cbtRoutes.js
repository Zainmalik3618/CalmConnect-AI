const express = require('express');
const cbtController = require('../controllers/cbtController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Thought Records
router.get('/thoughts', auth, cbtController.getThoughtRecords);
router.post('/thoughts', auth, cbtController.addThoughtRecord);
router.put('/thoughts/:id', auth, cbtController.updateThoughtRecord);
router.delete('/thoughts/:id', auth, cbtController.deleteThoughtRecord);

// Completed Exercises
router.get('/exercises', auth, cbtController.getCompletedExercises);
router.post('/exercises', auth, cbtController.addCompletedExercise);

// Journaling Prompt
router.post('/journal-prompt', auth, cbtController.getJournalingPrompt);


module.exports = router;
