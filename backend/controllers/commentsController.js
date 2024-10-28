const db = require('../db'); // Ensure correct DB connection

// Create a new comment for a review
const createComment = async (req, res) => {
    const { review_id } = req.params;
    const { user_id, content } = req.body;

    if (!user_id || !content) {
        return res.status(400).json({ error: 'Missing required fields: user_id or content' });
    }

    try {
        const newComment = await db.query(
            'INSERT INTO comments (user_id, review_id, content) VALUES ($1, $2, $3) RETURNING *',
            [user_id, review_id, content]
        );
        res.status(201).json(newComment.rows[0]);
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'Failed to post comment' });
    }
};

// Fetch all comments for a specific review
const getCommentsByReviewId = async (req, res) => {
    const { review_id } = req.params;

    try {
        const comments = await db.query(
            'SELECT c.id, c.user_id, u.username, c.content, c.created_at FROM comments c JOIN users u ON c.user_id = u.id WHERE c.review_id = $1 ORDER BY c.created_at ASC',
            [review_id]
        );
        res.json(comments.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

module.exports = {
    createComment,
    getCommentsByReviewId,
};
