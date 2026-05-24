const express = require('express');
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/sessions', auth, chatController.getChatSessions);
router.post('/sessions', auth, chatController.createChatSession);
router.put('/sessions/:sessionId', auth, chatController.updateSessionTitle);
router.delete('/sessions/:sessionId', auth, chatController.deleteChatSession);

router.post('/sessions/:sessionId/messages', auth, chatController.addMessageToSession);
router.put('/messages/:messageId/feedback', auth, chatController.updateMessageFeedback);

module.exports = router;
