const db = require('../services/db');
const motivationService = require('../services/motivationService');

exports.getMoodEntries = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id, mood, notes, date FROM mood_entries WHERE user_id = $1 ORDER BY date ASC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addMoodEntry = async (req, res) => {
    const { mood, notes } = req.body;
    try {
        const newEntry = await db.query(
            'INSERT INTO mood_entries (user_id, mood, notes) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, mood, notes]
        );

        // Record mood activity (checks for mood_tracker badge)
        await motivationService.recordActivity(req.user.id, 'mood');

        res.status(201).json(newEntry.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};