const db = require('../services/db');
const motivationService = require('../services/motivationService');

exports.getJournalEntries = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY date DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addJournalEntry = async (req, res) => {
    const { content } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO journal_entries (user_id, content) VALUES ($1, $2) RETURNING *',
            [req.user.id, content]
        );

        // Record journal activity (checks for first_journal badge)
        await motivationService.recordActivity(req.user.id, 'journal');

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateJournalEntry = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE journal_entries SET content = $1, date = now() WHERE id = $2 AND user_id = $3 RETURNING *',
            [content, id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Entry not found or user not authorized' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteJournalEntry = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteRes = await db.query(
            'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        if (deleteRes.rowCount === 0) {
            return res.status(404).json({ msg: 'Entry not found or user not authorized' });
        }
        res.json({ msg: 'Entry deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};