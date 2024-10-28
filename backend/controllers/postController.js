// controllers/postController.js
const pool = require('../db');

// Get all posts
const getPosts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY timestamp DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new post
const createPost = async (req, res) => {
    const { content, recommendation, user } = req.body;

    try {
        const newPost = await pool.query(
            'INSERT INTO posts (content, recommendation, user) VALUES ($1, $2, $3) RETURNING *',
            [content, recommendation, user]
        );
        res.status(201).json(newPost.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Export the controller functions
module.exports = {
    getPosts,
    createPost,
};

