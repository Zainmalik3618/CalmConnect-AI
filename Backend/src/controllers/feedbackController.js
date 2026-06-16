
const db = require('../services/db');
const notificationController = require('./notificationController');

exports.submitFeedback = async (req, res) => {
    const { appointmentId, targetId, type, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    try {
        const query = `
            INSERT INTO feedback (user_id, appointment_id, target_id, type, rating, comment)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const { rows } = await db.query(query, [userId, appointmentId, targetId, type, rating, comment]);
        
        // If this feedback is associated with an appointment, notify the other party
        if (appointmentId) {
            try {
                const apptQuery = 'SELECT patient_id, psychiatrist_id, date, time FROM appointments WHERE id = $1';
                const { rows: apptRows } = await db.query(apptQuery, [appointmentId]);
                if (apptRows.length > 0) {
                    const appt = apptRows[0];
                    // Identify the other party
                    const otherPartyId = req.user.id === appt.patient_id ? appt.psychiatrist_id : appt.patient_id;
                    
                    if (otherPartyId) {
                        const senderName = req.user.username || 'The other party';
                        const senderRole = req.user.role === 'patient' ? 'Patient' : req.user.role === 'psychiatrist' ? 'Psychiatrist' : 'User';
                        const dateStr = appt.date instanceof Date ? appt.date.toISOString().split('T')[0] : appt.date;
                        
                        await notificationController.createNotification(
                            otherPartyId,
                            'appointment_feedback',
                            'Session Feedback Received',
                            `${senderRole} ${senderName} has left feedback for your appointment on ${dateStr} at ${appt.time} (Rating: ${rating}/5).`,
                            '/appointments'
                        );
                    }
                }
            } catch (notifyErr) {
                console.error('Error sending feedback notification:', notifyErr.message);
            }
        }

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllFeedback = async (req, res) => {
    // Only admin should access this
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    try {
        const query = `
            SELECT f.*, u.username as reporter_name, t.username as target_name
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            LEFT JOIN users t ON f.target_id = t.id
            ORDER BY f.created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
