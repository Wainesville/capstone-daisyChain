const db = require('../db'); // Import your database connection

// Submit a new review
const submitReview = async (req, res) => {
    // Your existing code
};

// Get reviews for a specific movie
const getReviewsByMovie = async (req, res) => {
    // Your existing code
};

// Get all reviews
const getAllReviews = async (req, res) => {
    // Your existing code
};

// Like a review
const likeReview = async (req, res) => {
    // Your existing code
};

// Unlike a review
const unlikeReview = async (req, res) => {
    // Your existing code
};

// Get likes count for a review
const getLikesCount = async (req, res) => {
    // Your existing code
};

// Get reviews by user ID
const getReviewsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query('SELECT * FROM reviews WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No reviews found for this user' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

module.exports = {
    submitReview,
    getReviewsByMovie,
    getAllReviews,
    likeReview,
    unlikeReview,
    getLikesCount,
    getReviewsByUserId,
};