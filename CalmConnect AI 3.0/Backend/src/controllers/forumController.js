const db = require('../services/db');
const notificationController = require('./notificationController');

exports.getPosts = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT 
                p.id, 
                p.title, 
                p.content, 
                p.is_anonymous, 
                p.created_at,
                p.user_id,
                u.username,
                u.role,
                (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id)::int as comment_count
            FROM forum_posts p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);

        const formattedPosts = rows.map(post => {
            const isAuthor = req.user.id === post.user_id;
            const isAdmin = req.user.role === 'admin';
            return {
                id: post.id,
                title: post.title,
                content: post.content,
                is_anonymous: post.is_anonymous,
                created_at: post.created_at,
                comment_count: post.comment_count,
                authorName: post.is_anonymous ? 'Anonymous Peer' : post.username,
                authorRole: post.is_anonymous ? 'Member' : post.role,
                canDelete: isAuthor || isAdmin,
                isAuthor,
                user_id: post.user_id
            };
        });

        res.json(formattedPosts);
    } catch (err) {
        console.error('Error fetching forum posts:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const postRes = await db.query(`
            SELECT p.id, p.title, p.content, p.is_anonymous, p.created_at, p.user_id, u.username, u.role
            FROM forum_posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `, [id]);

        if (postRes.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = postRes.rows[0];
        const isAuthor = req.user.id === post.user_id;
        const isAdmin = req.user.role === 'admin';

        const commentsRes = await db.query(`
            SELECT c.id, c.content, c.is_anonymous, c.created_at, c.user_id, u.username, u.role
            FROM forum_comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [id]);

        const formattedComments = commentsRes.rows.map(comment => {
            const isCommentAuthor = req.user.id === comment.user_id;
            return {
                id: comment.id,
                content: comment.content,
                is_anonymous: comment.is_anonymous,
                created_at: comment.created_at,
                authorName: comment.is_anonymous ? 'Anonymous Peer' : comment.username,
                authorRole: comment.is_anonymous ? 'Member' : comment.role,
                canDelete: isCommentAuthor || isAdmin
            };
        });

        res.json({
            id: post.id,
            title: post.title,
            content: post.content,
            is_anonymous: post.is_anonymous,
            created_at: post.created_at,
            authorName: post.is_anonymous ? 'Anonymous Peer' : post.username,
            authorRole: post.is_anonymous ? 'Member' : post.role,
            canDelete: isAuthor || isAdmin,
            isAuthor,
            user_id: post.user_id,
            comments: formattedComments
        });
    } catch (err) {
        console.error('Error fetching forum post details:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createPost = async (req, res) => {
    const { title, content, is_anonymous } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const { rows } = await db.query(`
            INSERT INTO forum_posts (user_id, title, content, is_anonymous)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [req.user.id, title, content, !!is_anonymous]);

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating post:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createComment = async (req, res) => {
    const { id } = req.params;
    const { content, is_anonymous } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Comment content is required' });
    }

    try {
        const postCheck = await db.query('SELECT id, user_id, title FROM forum_posts WHERE id = $1', [id]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const post = postCheck.rows[0];

        const { rows } = await db.query(`
            INSERT INTO forum_comments (post_id, user_id, content, is_anonymous)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [id, req.user.id, content, !!is_anonymous]);

        const comment = rows[0];

        // Notify the original post's author if the comment is from someone else
        if (post.user_id && post.user_id !== req.user.id) {
            const commenterName = !!is_anonymous ? 'An anonymous peer' : req.user.username;
            const previewText = content.length > 60 ? `${content.substring(0, 60)}...` : content;
            await notificationController.createNotification(
                post.user_id,
                'forum_reply',
                'New Forum Reply',
                `${commenterName} replied to your forum post "${post.title}": "${previewText}"`,
                '/forum'
            );
        }
        res.status(201).json({
            id: comment.id,
            content: comment.content,
            is_anonymous: comment.is_anonymous,
            created_at: comment.created_at,
            authorName: comment.is_anonymous ? 'Anonymous Peer' : req.user.username,
            authorRole: comment.is_anonymous ? 'Member' : req.user.role,
            canDelete: true
        });
    } catch (err) {
        console.error('Error creating comment:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const postRes = await db.query('SELECT user_id FROM forum_posts WHERE id = $1', [id]);
        if (postRes.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = postRes.rows[0];
        if (post.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await db.query('DELETE FROM forum_posts WHERE id = $1', [id]);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;
    try {
        const commentRes = await db.query('SELECT user_id, post_id FROM forum_comments WHERE id = $1', [commentId]);
        if (commentRes.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = commentRes.rows[0];
        if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await db.query('DELETE FROM forum_comments WHERE id = $1', [commentId]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};