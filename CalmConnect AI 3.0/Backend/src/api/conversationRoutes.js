
const express = require('express');
const conversationController = require('../controllers/conversationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, conversationController.getConversations);
router.post('/messages', auth, conversationController.sendMessage);
router.put('/:conversationId/read', auth, conversationController.markAsRead);
router.put('/messages/:messageId', auth, conversationController.updateMessage);
router.delete('/messages/:messageId', auth, conversationController.deleteMessage);


module.exports = router;
