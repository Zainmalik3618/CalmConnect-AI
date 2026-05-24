const db = require('../services/db');
const geminiService = require('../services/geminiService');
const motivationService = require('../services/motivationService');

// --- Thought Records ---

exports.getThoughtRecords = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM thought_records WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addThoughtRecord = async (req, res) => {
    const { situation, automatic_thought, evidence_for, evidence_against, alternative_thought, outcome } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO thought_records (user_id, situation, automatic_thought, evidence_for, evidence_against, alternative_thought, outcome) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.user.id, situation, automatic_thought, evidence_for, evidence_against, alternative_thought, outcome]
        );

        // Record CBT activity
        await motivationService.recordActivity(req.user.id, 'cbt');

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateThoughtRecord = async (req, res) => {
    const { id } = req.params;
    const { situation, automatic_thought, evidence_for, evidence_against, alternative_thought, outcome } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE thought_records SET situation = $1, automatic_thought = $2, evidence_for = $3, evidence_against = $4, alternative_thought = $5, outcome = $6, date = now() WHERE id = $7 AND user_id = $8 RETURNING *',
            [situation, automatic_thought, evidence_for, evidence_against, alternative_thought, outcome, id, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ msg: 'Record not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteThoughtRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM thought_records WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Record not found' });
        res.json({ msg: 'Record deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Completed Exercises ---

exports.getCompletedExercises = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM completed_exercises WHERE user_id = $1', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addCompletedExercise = async (req, res) => {
    const { exercise_id } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO completed_exercises (user_id, exercise_id) VALUES ($1, $2) RETURNING *',
            [req.user.id, exercise_id]
        );

        // Record CBT activity (checks for cbt_master badge)
        await motivationService.recordActivity(req.user.id, 'cbt');

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Journaling Prompt ---

exports.getJournalingPrompt = async (req, res) => {
    const { theme } = req.body;
    try {
        // Fetch context from DB
        const moodResult = await db.query('SELECT mood, date FROM mood_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 5', [req.user.id]);
        
        // Fetch latest chat session
        const chatSessionResult = await db.query('SELECT id FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1', [req.user.id]);

        let chatHistory = [];
        if (chatSessionResult.rows.length > 0) {
            const messageResult = await db.query('SELECT sender, text FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 5', [chatSessionResult.rows[0].id]);
            chatHistory = messageResult.rows;
        }

        const prompt = await geminiService.getJournalingPrompt(moodResult.rows, chatHistory, theme);
        res.json({ prompt });

    } catch (error) {
        console.error("Error generating journal prompt:", error);
        res.status(500).json({ prompt: "What is one thing you're grateful for today, no matter how small?" });
    }
};