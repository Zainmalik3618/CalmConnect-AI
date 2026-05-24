const db = require('../services/db');
const notificationController = require('./notificationController');

exports.getAppointments = async (req, res) => {
    try {
        let query;
        let queryParams = [req.user.id];

        if (req.user.role === 'admin') {
            // Admins can see all appointments
            query = 'SELECT * FROM appointments ORDER BY date DESC, time DESC';
            queryParams = []; // No user ID filter needed for admin
        } else {
            // Patients and psychiatrists only see their own
            query = 'SELECT * FROM appointments WHERE patient_id = $1 OR psychiatrist_id = $1 ORDER BY date DESC, time DESC';
        }

        const { rows } = await db.query(query, queryParams);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.scheduleAppointment = async (req, res) => {
    const { patientId, date, time, notes } = req.body;
    const psychiatristId = req.user.id;

    try {
        const { rows } = await db.query(
            'INSERT INTO appointments (psychiatrist_id, patient_id, date, time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [psychiatristId, patientId, date, time, notes]
        );

        // Notify patient
        await notificationController.createNotification(
            patientId,
            'appointment_new',
            'New Appointment Scheduled',
            `A new appointment has been scheduled for ${date} at ${time}.`,
            '/appointments'
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.cancelAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        let query;
        let queryParams = [id, req.user.id];
        
        // Admins can cancel any appointment, others can only cancel their own.
        if (req.user.role === 'admin') {
            query = "UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *";
            queryParams = [id];
        } else {
            query = "UPDATE appointments SET status = 'cancelled' WHERE id = $1 AND (patient_id = $2 OR psychiatrist_id = $2) RETURNING *";
        }
        
        const { rows } = await db.query(query, queryParams);
        
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Appointment not found or you are not authorized to cancel it.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        // Ensure the user is part of the appointment they are trying to complete
        const { rows } = await db.query(
            "UPDATE appointments SET status = 'completed' WHERE id = $1 AND (patient_id = $2 OR psychiatrist_id = $2) RETURNING *",
            [id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Appointment not found or you are not authorized to cancel it.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAppointmentsAsSeen = async (req, res) => {
    // This is a patient-specific action
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Only patients can perform this action.' });
    }
    try {
        const { rows } = await db.query(
            "UPDATE appointments SET patient_has_seen = true WHERE patient_id = $1 AND patient_has_seen = false RETURNING id",
            [req.user.id]
        );
        res.json({ message: 'Appointments marked as seen', count: rows.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};