const db = require('../services/db');
const geminiService = require('../services/geminiService');

exports.getChatSessions = async (req, res) => {
    try {
        const sessionsQuery = `
            SELECT cs.id, cs.title, cs.created_at, cs.updated_at
            FROM chat_sessions cs
            WHERE cs.user_id = $1
            ORDER BY cs.updated_at DESC
        `;
        const { rows: sessions } = await db.query(sessionsQuery, [req.user.id]);
        
        // Fetch messages for each session
        for (let session of sessions) {
            const messagesQuery = `
                SELECT id, sender, text, source, feedback, created_at 
                FROM chat_messages 
                WHERE session_id = $1 
                ORDER BY created_at ASC
            `;
            const { rows: messages } = await db.query(messagesQuery, [session.id]);
            session.messages = messages;
        }

        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createChatSession = async (req, res) => {
    const { text, source } = req.body;
    try {
        // Create new session
        const title = "New Conversation...";
        const { rows: sessionRows } = await db.query(
            'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
            [req.user.id, title]
        );
        const newSession = sessionRows[0];

        // Add user message
        const { rows: messageRows } = await db.query(
            'INSERT INTO chat_messages (session_id, sender, text, source) VALUES ($1, $2, $3, $4) RETURNING *',
            [newSession.id, 'user', text, source]
        );
        const userMessage = messageRows[0];

        // Get AI response
        const aiResponseText = await geminiService.getAIResponse(text, [], req.user);
        const { rows: aiMessageRows } = await db.query(
            'INSERT INTO chat_messages (session_id, sender, text, source) VALUES ($1, $2, $3, $4) RETURNING *',
            [newSession.id, 'ai', aiResponseText, 'text']
        );
        const aiMessage = aiMessageRows[0];
        
        // Generate and update title
        const newTitle = await geminiService.getChatTitle([userMessage, aiMessage]);
        await db.query(
            'UPDATE chat_sessions SET title = $1 WHERE id = $2',
            [newTitle, newSession.id]
        );
        
        newSession.title = newTitle;
        newSession.messages = [userMessage, aiMessage];

        res.status(201).json(newSession);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addMessageToSession = async (req, res) => {
    const { sessionId } = req.params;
    const { text, source } = req.body;

    try {
        // Verify session ownership
        const sessionRes = await db.query('SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2', [sessionId, req.user.id]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ message: 'Session not found' });

        // Get history
        const historyRes = await db.query('SELECT sender, text, feedback, source FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC', [sessionId]);

        // Add user message
        const { rows: messageRows } = await db.query(
            'INSERT INTO chat_messages (session_id, sender, text, source) VALUES ($1, $2, $3, $4) RETURNING *',
            [sessionId, 'user', text, source]
        );
        
        // Get AI response
        const aiResponseText = await geminiService.getAIResponse(text, historyRes.rows, req.user);
        const { rows: aiMessageRows } = await db.query(
            'INSERT INTO chat_messages (session_id, sender, text, source) VALUES ($1, $2, $3, $4) RETURNING *',
            [sessionId, 'ai', aiResponseText, 'text']
        );
        
        res.status(201).json({ userMessage: messageRows[0], aiMessage: aiMessageRows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateMessageFeedback = async (req, res) => {
    const { messageId } = req.params;
    const { feedback } = req.body; // 'like', 'dislike', or null

    if (feedback && !['like', 'dislike'].includes(feedback)) {
        return res.status(400).json({ message: 'Invalid feedback value' });
    }

    try {
        // Subquery to verify the user owns the session this message belongs to
        const query = `
            UPDATE chat_messages
            SET feedback = $1
            WHERE id = $2 AND session_id IN (SELECT id FROM chat_sessions WHERE user_id = $3)
            RETURNING *
        `;
        const { rows } = await db.query(query, [feedback, messageId, req.user.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Message not found or not authorized' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateSessionTitle = async (req, res) => {
    const { sessionId } = req.params;
    const { title } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE chat_sessions SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [title, sessionId, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ msg: 'Session not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteChatSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const result = await db.query('DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2', [sessionId, req.user.id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Session not found' });
        res.json({ msg: 'Session deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};