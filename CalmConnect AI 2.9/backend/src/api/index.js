const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const moodRoutes = require('./moodRoutes');
const journalRoutes = require('./journalRoutes');
const cbtRoutes = require('./cbtRoutes');
const chatRoutes = require('./chatRoutes');
const conversationRoutes = require('./conversationRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const notificationRoutes = require('./notificationRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const reportRoutes = require('./reportRoutes');
const motivationRoutes = require('./motivationRoutes');
const forumRoutes = require('./forumRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/mood', moodRoutes);
router.use('/journal', journalRoutes);
router.use('/cbt', cbtRoutes);
router.use('/chat', chatRoutes);
router.use('/conversations', conversationRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/reports', reportRoutes);
router.use('/motivation', motivationRoutes);
router.use('/forum', forumRoutes);

module.exports = router;