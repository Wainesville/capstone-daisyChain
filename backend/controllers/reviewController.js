const db = require('../db'); // Import your database connection

// Submit a new review
const submitReview = async (req, res) => {
    const { user_id, movie_id, content, recommendation } = req.body;
    
    try {
        const newReview = await db.query(
            'INSERT INTO reviews (user_id, movie_id, content, recommendation) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, movie_id, content, recommendation]
        );
        res.status(201).json(newReview.rows[0]);
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};

// Get reviews for a specific movie
const getReviewsByMovie = async (req, res) => {
    const { movieId } = req.params;

    try {
        const reviews = await db.query('SELECT * FROM reviews WHERE movie_id = $1', [movieId]);
        res.json(reviews.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

module.exports = { submitReview, getReviewsByMovie };
