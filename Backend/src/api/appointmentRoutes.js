const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { auth, psychiatristAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, appointmentController.getAppointments);
router.post('/', auth, psychiatristAuth, appointmentController.scheduleAppointment);
router.put('/:id/cancel', auth, appointmentController.cancelAppointment);
router.put('/:id/complete', auth, appointmentController.updateAppointment);
router.put('/seen', auth, appointmentController.markAppointmentsAsSeen);

module.exports = router;