const pool = require('../db');

// Get All Movies
const getAllMovies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

// Create a new review
const createReview = async (req, res) => {
  const { user_id, movie_id, content, recommendation, movie_title, thumbnail, logo } = req.body;

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
      'INSERT INTO reviews (user_id, movie_id, content, recommendation) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, movie_id, content, recommendation]
    );

    res.status(201).json(newReview.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get reviews for a specific movie, including the movie logo
const getReviewsByMovieId = async (req, res) => {
  const { movie_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT r.id, r.user_id, r.content, r.created_at, r.recommendation, m.thumbnail, m.title AS movie_title, m.logo
      FROM reviews r
      JOIN movies m ON r.movie_id = m.id 
      WHERE r.movie_id = $1
    `, [movie_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = {
  getAllMovies,
  createReview,
  getReviewsByMovieId,
};