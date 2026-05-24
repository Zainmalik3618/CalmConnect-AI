const express = require('express');
const forumController = require('../controllers/forumController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/forum/posts
// @desc    Get all active discussion posts with comment counts
// @access  Private
router.get('/posts', auth, forumController.getPosts);

// @route   GET api/forum/posts/:id
// @desc    Get a single discussion post along with its comments
// @access  Private
router.get('/posts/:id', auth, forumController.getPostById);

// @route   POST api/forum/posts
// @desc    Create a new discussion post (with anonymous option)
// @access  Private
router.post('/posts', auth, forumController.createPost);

// @route   POST api/forum/posts/:id/comments
// @desc    Reply/Add a comment to an existing post (with anonymous option)
// @access  Private
router.post('/posts/:id/comments', auth, forumController.createComment);

// @route   DELETE api/forum/posts/:id
// @desc    Delete a discussion post (author or admin only)
// @access  Private
router.delete('/posts/:id', auth, forumController.deletePost);

// @route   DELETE api/forum/comments/:commentId
// @desc    Delete a comment (author or admin only)
// @access  Private
router.delete('/comments/:commentId', auth, forumController.deleteComment);

module.exports = router;
