const db = require('../db'); // Import your database connection

// Submit a new review
const submitReview = async (req, res) => {
    const { user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo } = req.body; // include all fields

    try {
        const newReview = await db.query(
            'INSERT INTO reviews (user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo]  // add all fields
        );
        res.status(201).json(newReview.rows[0]);
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};

// Create a new review
router.post('/', async (req, res) => {
    const { user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo } = req.body;

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
            await db.query(
                'INSERT INTO movies (id, title, thumbnail, logo) VALUES ($1, $2, $3, $4)',
                [movie_id, movie_title, thumbnail, logo]
            );
        }

        // Proceed to insert the review
        const newReview = await db.query(
            'INSERT INTO reviews (user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo]
        );

        res.status(201).json(newReview.rows[0]);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// Get reviews for a specific movie
const getReviewsByMovie = async (req, res) => {
    const { movie_id } = req.params;

    try {
        const reviews = await db.query(`
            SELECT r.id, r.user_id, r.content, r.created_at, r.recommendation, r.movie_title, r.thumbnail, r.rating, r.logo, m.thumbnail AS movie_thumbnail, m.title AS movie_title, m.logo AS movie_logo
            FROM reviews r
            JOIN movies m ON r.movie_id = m.id 
            WHERE r.movie_id = $1
        `, [movie_id]);

        res.json(reviews.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await db.query(`
            SELECT r.*, u.username, m.thumbnail AS movie_thumbnail, m.title AS movie_title, m.logo AS movie_logo 
            FROM reviews r
            JOIN users u ON r.user_id = u.id 
            JOIN movies m ON r.movie_id = m.id 
            ORDER BY r.created_at DESC
        `);
        res.status(200).json(reviews.rows);
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Like a review
const likeReview = async (req, res) => {
    const { user_id } = req.body;
    const { review_id } = req.params;

    try {
        const checkExistingLike = await db.query(
            'SELECT * FROM review_likes WHERE review_id = $1 AND user_id = $2',
            [review_id, user_id]
        );

        if (checkExistingLike.rows.length > 0) {
            return res.status(409).json({ error: 'User has already liked this review' });
        }

        const result = await db.query(
            'INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2) RETURNING *',
            [review_id, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error liking review:', error);
        res.status(500).json({ error: 'Failed to like review' });
    }
};

// Unlike a review
const unlikeReview = async (req, res) => {
    const { user_id } = req.body;
    const { review_id } = req.params;

    try {
        await db.query(
            'DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2',
            [review_id, user_id]
        );

        const likeCount = await db.query(
            'SELECT COUNT(*) FROM review_likes WHERE review_id = $1',
            [review_id]
        );

        res.status(200).json({ likes: parseInt(likeCount.rows[0].count) });
    } catch (error) {
        console.error('Error unliking review:', error);
        res.status(500).json({ error: 'Failed to unlike review' });
    }
};

// Get likes count for a review
const getLikesCount = async (req, res) => {
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
};

module.exports = {
    submitReview,
    getReviewsByMovie,
    getAllReviews,
    likeReview,
    unlikeReview,
    getLikesCount
};