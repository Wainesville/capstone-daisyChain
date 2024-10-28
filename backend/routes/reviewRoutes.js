const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this is your actual database connection

// Create a new review
router.post('/', async (req, res) => {
    const { user_id, movie_id, content, recommendation, movie_title, thumbnail } = req.body;

    console.log('Request Body:', req.body);

    // Validate required fields
    if (!user_id || !movie_id || !content || !movie_title || !thumbnail) {
        return res.status(400).json({ error: 'Missing required fields: user_id, movie_id, content, movie_title, thumbnail' });
    }

    try {
        // Check if the movie exists
        const movieCheck = await db.query('SELECT * FROM movies WHERE id = $1', [movie_id]);

        // If the movie does not exist, insert it into the movies table
        if (movieCheck.rows.length === 0) {
            await db.query( // Changed from pool to db
                'INSERT INTO movies (id, title, thumbnail) VALUES ($1, $2, $3)',
                [movie_id, movie_title, thumbnail]
            );
        }

        // Proceed to insert the review
        const newReview = await db.query(
            'INSERT INTO reviews (user_id, movie_id, content, recommendation) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, movie_id, content, recommendation]
        );

        res.status(201).json(newReview.rows[0]);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});


// Get reviews for a specific movie
router.get('/:movie_id', async (req, res) => {
    const { movie_id } = req.params;

    try {
        const result = await db.query(`
            SELECT r.id, r.user_id, r.content, r.created_at, r.recommendation, m.thumbnail, m.title AS movie_title
            FROM reviews r
            JOIN movies m ON r.movie_id = m.id 
            WHERE r.movie_id = $1
        `, [movie_id]);

        res.json(result.rows); // Send back the reviews and thumbnails
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});


// Other routes remain unchanged...


// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await db.query(
            'SELECT r.*, u.username, m.thumbnail, m.title FROM reviews r JOIN users u ON r.user_id = u.id JOIN movies m ON r.movie_id = m.id ORDER BY r.created_at DESC'
        );
        res.status(200).json(reviews.rows);
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Like a review
// Like a review
router.post('/:review_id/like', async (req, res) => {
    const { user_id } = req.body; // Get the user ID from the request body
    const { review_id } = req.params; // Get the review ID from the URL

    try {
        // Check if the user has already liked this review
        const checkExistingLike = await db.query(
            'SELECT * FROM review_likes WHERE review_id = $1 AND user_id = $2',
            [review_id, user_id]
        );

        if (checkExistingLike.rows.length > 0) {
            // If the like already exists, return a conflict response or handle it gracefully
            return res.status(409).json({ error: 'User has already liked this review' });
        }

        // Insert a new like if it doesn't already exist
        const result = await db.query(
            'INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2) RETURNING *',
            [review_id, user_id]
        );
        res.status(201).json(result.rows[0]);  // Send back the newly inserted like
    } catch (error) {
        console.error('Error liking review:', error);
        res.status(500).json({ error: 'Failed to like review' });
    }
});



// Unlike a review
router.delete('/:review_id/like', async (req, res) => {
    const { user_id } = req.body; // Get the user ID from the request body
    const { review_id } = req.params; // Get the review ID from the URL

    try {
        await db.query(
            'DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2',
            [review_id, user_id]
        );

        // Fetch the updated like count
        const result = await db.query(
            'SELECT COUNT(*) FROM review_likes WHERE review_id = $1',
            [review_id]
        );

        // Return the updated like count
        res.status(200).json({ likes: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error unliking review:', error);
        res.status(500).json({ error: 'Failed to unlike review' });
    }
});


// Get likes count for a review
router.get('/:review_id/likes', async (req, res) => {
    const { review_id } = req.params;

    try {
        const result = await db.query(
            'SELECT COUNT(*) FROM review_likes WHERE review_id = $1',
            [review_id]
        );
        res.status(200).json({ likes: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error fetching likes count:', error);
        res.status(500).json({ error: 'Failed to fetch likes count' });
    }
});

module.exports = router;
