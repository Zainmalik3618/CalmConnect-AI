
const db = require('../services/db');
const cryptoService = require('../services/cryptoService');
const notificationController = require('./notificationController');

exports.getConversations = async (req, res) => {
    try {
        const { rows: participantRows } = await db.query(
            'SELECT conversation_id FROM conversation_participants WHERE user_id = $1',
            [req.user.id]
        );
        const conversationIds = participantRows.map(p => p.conversation_id);

        if (conversationIds.length === 0) {
            return res.json([]);
        }

        const { rows: conversations } = await db.query(
            `SELECT c.id, 
                    (SELECT array_agg(cp.user_id) FROM conversation_participants cp WHERE cp.conversation_id = c.id) as "participantIds"
             FROM conversations c
             WHERE c.id = ANY($1)`,
            [conversationIds]
        );
        
        for (let convo of conversations) {
             const { rows: messages } = await db.query(
                'SELECT id, sender_id as "senderId", text, timestamp, status FROM direct_messages WHERE conversation_id = $1 ORDER BY timestamp ASC',
                [convo.id]
            );
            
            // Decrypt each message text for the authorized participant
            convo.messages = messages.map(msg => ({
                ...msg,
                text: cryptoService.decrypt(msg.text)
            }));
        }

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sendMessage = async (req, res) => {
    const { recipientId, text } = req.body;
    const senderId = req.user.id;

    if (senderId === recipientId) {
        return res.status(400).json({ message: "Cannot send message to yourself." });
    }

    try {
        // Find existing conversation
        const findConvoQuery = `
          SELECT conversation_id
          FROM conversation_participants
          WHERE user_id IN ($1, $2)
          GROUP BY conversation_id
          HAVING COUNT(DISTINCT user_id) = 2
          LIMIT 1
        `;
        let { rows: convoRows } = await db.query(findConvoQuery, [senderId, recipientId]);
        
        let conversationId;

        if (convoRows.length > 0) {
            conversationId = convoRows[0].conversation_id;
        } else {
            // Create a new conversation
            const { rows: newConvoRows } = await db.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
            conversationId = newConvoRows[0].id;

            // Add participants
            await db.query('INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)', [conversationId, senderId, recipientId]);
        }
        
        // Encrypt message text before storing in the database
        const encryptedText = cryptoService.encrypt(text);

        // Insert the encrypted message
        const { rows: messageRows } = await db.query(
            'INSERT INTO direct_messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING id, sender_id as "senderId", text, timestamp, status',
            [conversationId, senderId, encryptedText]
        );

        // Notify recipient
        const { rows: senderRows } = await db.query('SELECT username FROM users WHERE id = $1', [senderId]);
        const senderName = senderRows[0]?.username || 'Someone';
        
        await notificationController.createNotification(
            recipientId,
            'dm',
            'New Message',
            `You received a new message from ${senderName}.`,
            '/messaging'
        );
        
        // Decrypt the text back for the immediate response to the sender
        const responseMessage = {
            ...messageRows[0],
            text: cryptoService.decrypt(messageRows[0].text)
        };
        
        res.status(201).json({ message: responseMessage, conversationId });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateMessage = async (req, res) => {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    try {
        // Check if message exists, belongs to user, and is still in 'sent' or 'delivered' status (not 'read')
        const { rows } = await db.query(
            'SELECT * FROM direct_messages WHERE id = $1 AND sender_id = $2',
            [messageId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Message not found or not authorized.' });
        }

        const message = rows[0];
        if (message.status === 'read') {
            return res.status(400).json({ message: 'Message cannot be edited after it has been read.' });
        }

        const encryptedText = cryptoService.encrypt(text);

        const updateResult = await db.query(
            'UPDATE direct_messages SET text = $1 WHERE id = $2 RETURNING id, sender_id as "senderId", text, timestamp, status',
            [encryptedText, messageId]
        );

        const responseMessage = {
            ...updateResult.rows[0],
            text: cryptoService.decrypt(updateResult.rows[0].text)
        };

        res.json(responseMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    try {
        // Ensure user is part of the conversation
        const participantCheck = await db.query(
            'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
            [conversationId, userId]
        );
        if (participantCheck.rowCount === 0) {
            return res.status(403).json({ message: 'Not authorized to view this conversation.' });
        }

        // Update messages that were not sent by the current user
        const { rows } = await db.query(
            "UPDATE direct_messages SET status = 'read' WHERE conversation_id = $1 AND sender_id != $2 AND status != 'read' RETURNING *",
            [conversationId, userId]
        );
        
        res.json({ message: "Messages marked as read", updatedCount: rows.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            'DELETE FROM direct_messages WHERE id = $1 AND sender_id = $2',
            [messageId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Message not found or you are not authorized to delete it.' });
        }

        res.json({ message: 'Message deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
