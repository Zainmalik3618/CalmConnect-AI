
const db = require('../services/db');
const emailService = require('../services/emailService');

exports.getNotifications = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
            [req.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteNotification = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.checkReminders = async (req, res) => {
    try {
        // Check for appointments in the next 24 hours that haven't been notified yet
        // We can use a simple logic: if there's an appointment tomorrow, send a notification
        const { rows } = await db.query(
            `SELECT * FROM appointments 
             WHERE (patient_id = $1 OR psychiatrist_id = $1) 
             AND status = 'scheduled' 
             AND date = CURRENT_DATE + INTERVAL '1 day'`,
            [req.user.id]
        );

        for (let appt of rows) {
            // Format the date to YYYY-MM-DD for the reminder message and check
            const dateStr = appt.date instanceof Date ? appt.date.toISOString().split('T')[0] : appt.date;
            
            // Check if a reminder already exists for this appointment today
            const { rows: existing } = await db.query(
                `SELECT 1 FROM notifications 
                 WHERE user_id = $1 
                 AND type = 'appointment_reminder' 
                 AND message LIKE $2 
                 AND created_at >= CURRENT_DATE`,
                [req.user.id, `%${dateStr}%`]
            );

            if (existing.length === 0) {
                await exports.createNotification(
                    req.user.id,
                    'appointment_reminder',
                    'Upcoming Appointment Reminder',
                    `Reminder: You have an appointment tomorrow (${dateStr}) at ${appt.time}.`,
                    '/appointments'
                );
            }
        }
        res.json({ message: 'Reminders checked' });
    } catch (err) {
        console.error('Error checking reminders:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper function to create notifications (internal use)
exports.createNotification = async (userId, type, title, message, link = null) => {
    try {
        // 1. Save to database
        await db.query(
            'INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)',
            [userId, type, title, message, link]
        );

        // 2. Fetch user email to send notification email
        const { rows } = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
        if (rows.length > 0) {
            const userEmail = rows[0].email;
            // Send email asynchronously (don't await to avoid blocking)
            emailService.sendNotificationEmail(userEmail, title, message, link);
        }
    } catch (err) {
        console.error('Error creating notification:', err.message);
    }
};
