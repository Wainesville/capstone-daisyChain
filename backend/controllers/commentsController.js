const pool = require('../db');

// Create a new comment
const createComment = async (req, res) => {
  const { review_id } = req.params;
  const { user_id, content } = req.body;

  // Validate required fields
  if (!user_id || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (review_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [review_id, user_id, content]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to post comment');
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
};

// Get comments by review ID
const getCommentsByReviewId = async (req, res) => {
  const { review_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM comments WHERE review_id = $1', [review_id]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

module.exports = {
  createComment,
  getCommentsByReviewId,
};