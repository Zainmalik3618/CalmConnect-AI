const express = require('express');
const journalController = require('../controllers/journalController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, journalController.getJournalEntries);
router.post('/', auth, journalController.addJournalEntry);
router.put('/:id', auth, journalController.updateJournalEntry);
router.delete('/:id', auth, journalController.deleteJournalEntry);

module.exports = router;
