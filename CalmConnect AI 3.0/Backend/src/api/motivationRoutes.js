
const express = require('express');
const motivationController = require('../controllers/motivationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', auth, motivationController.getDashboard);
router.post('/activity', auth, motivationController.recordActivity);

module.exports = router;
