
const db = require('../services/db');

exports.submitReport = async (req, res) => {
    const { targetId, type, description } = req.body;
    const userId = req.user.id;

    if (!type || !description) {
        return res.status(400).json({ message: 'Type and description are required.' });
    }

    try {
        const query = `
            INSERT INTO reports (user_id, target_id, type, description, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await db.query(query, [userId, targetId, type, description, 'pending']);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllReports = async (req, res) => {
    // Only admin should access this
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    try {
        const query = `
            SELECT r.*, u.username as reporter_name, t.username as target_name
            FROM reports r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN users t ON r.target_id = t.id
            ORDER BY r.created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateReportStatus = async (req, res) => {
    // Only admin should access this
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        const query = `
            UPDATE reports SET status = $1 WHERE id = $2 RETURNING *
        `;
        const { rows } = await db.query(query, [status, id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Report not found.' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};