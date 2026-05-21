
const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.post('/', auth, reportController.submitReport);
router.get('/', auth, adminAuth, reportController.getAllReports);
router.put('/:id/status', auth, adminAuth, reportController.updateReportStatus);

module.exports = router;
