const pool = require('../db');

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get reviews by user ID
const getReviewsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM reviews WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews by user ID:', err);
    res.status(500).json({ error: 'Failed to fetch reviews by user ID' });
  }
};

// Get reviews by movie ID
const getReviewsByMovieId = async (req, res) => {
  const { movieId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM reviews WHERE movie_id = $1', [movieId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews by movie ID:', err);
    res.status(500).json({ error: 'Failed to fetch reviews by movie ID' });
  }
};

// Get likes for a review
const getLikesForReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const result = await pool.query('SELECT COUNT(*) AS likes FROM review_likes WHERE review_id = $1', [reviewId]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching likes for review:', err);
    res.status(500).json({ error: 'Failed to fetch likes for review' });
  }
};

// Get comments for a review
const getCommentsForReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM comments WHERE review_id = $1', [reviewId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching comments for review:', err);
    res.status(500).json({ error: 'Failed to fetch comments for review' });
  }
};

// Like a review
const likeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2) RETURNING *',
      [reviewId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error liking review:', err);
    res.status(500).json({ error: 'Failed to like review' });
  }
};

// Unlike a review
const unlikeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2 RETURNING *',
      [reviewId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }
    res.status(200).json({ message: 'Review unliked successfully' });
  } catch (err) {
    console.error('Error unliking review:', err);
    res.status(500).json({ error: 'Failed to unlike review' });
  }
};

// Create a review
const createReview = async (req, res) => {
  const { user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO reviews (user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

module.exports = {
  getAllReviews,
  getReviewsByUserId,
  getReviewsByMovieId,
  getLikesForReview,
  getCommentsForReview,
  likeReview,
  unlikeReview,
  createReview,
};