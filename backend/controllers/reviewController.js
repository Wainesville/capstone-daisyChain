const pool = require('../db');

// Get All Reviews
const getAllReviews = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get Reviews by User ID
const getReviewsByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query('SELECT * FROM reviews WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows); // Return an empty array if no reviews are found
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get Reviews by Movie ID
const getReviewsByMovieId = async (req, res) => {
  const movieId = req.params.movieId;

  try {
    const result = await pool.query('SELECT * FROM reviews WHERE movie_id = $1', [movieId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No reviews found for this movie' });
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get Likes for Review
const getLikesForReview = async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const result = await pool.query('SELECT COUNT(*) AS likes FROM review_likes WHERE review_id = $1', [reviewId]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching likes:', err);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};

// Get Comments for Review
const getCommentsForReview = async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const result = await pool.query('SELECT * FROM comments WHERE review_id = $1', [reviewId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Like a Review
const likeReview = async (req, res) => {
  const { reviewId } = req.params;
  const { user_id } = req.body;

  try {
    // Check if the user has already liked the review
    const existingLike = await pool.query('SELECT * FROM review_likes WHERE review_id = $1 AND user_id = $2', [reviewId, user_id]);
    if (existingLike.rows.length > 0) {
      return res.status(409).json({ error: 'User has already liked this review' });
    }

    // Add the like
    await pool.query('INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2)', [reviewId, user_id]);
    res.status(201).json({ message: 'Review liked' });
  } catch (err) {
    console.error('Error liking review:', err);
    res.status(500).json({ error: 'Failed to like review' });
  }
};

// Unlike a Review
const unlikeReview = async (req, res) => {
  const { reviewId } = req.params;
  const { user_id } = req.body;

  try {
    // Remove the like
    await pool.query('DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2', [reviewId, user_id]);
    res.status(200).json({ message: 'Review unliked' });
  } catch (err) {
    console.error('Error unliking review:', err);
    res.status(500).json({ error: 'Failed to unlike review' });
  }
};

// Create a Review
const createReview = async (req, res) => {
  const { user_id, movie_id, content, recommendation, rating, movie_title, thumbnail, logo } = req.body;

  // Validate required fields
  if (!user_id || !movie_id || !content || !movie_title || !thumbnail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the movie exists in the database
    const movieCheck = await pool.query('SELECT * FROM movies WHERE id = $1', [movie_id]);

    // If the movie doesn't exist, insert it with title, thumbnail, and logo
    if (movieCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO movies (id, title, thumbnail, logo) VALUES ($1, $2, $3, $4)',
        [movie_id, movie_title, thumbnail, logo]
      );
    }

    // Insert the new review
    const newReview = await pool.query(
      'INSERT INTO reviews (user_id, movie_id, content, recommendation, rating, movie_title, thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, movie_id, content, recommendation, rating, movie_title, thumbnail]
    );

    res.status(201).json(newReview.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
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