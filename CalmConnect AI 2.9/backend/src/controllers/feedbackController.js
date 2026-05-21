
const db = require('../services/db');

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