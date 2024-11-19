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
  const { user_id, movie_id, content, recommendation, movie_title, thumbnail } = req.body;

  // Validate required fields
  if (!user_id || !movie_id || !content || !movie_title || !thumbnail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the movie exists in the database
    const movieCheck = await pool.query('SELECT * FROM movies WHERE id = $1', [movie_id]);

    // If the movie doesn't exist, insert it with title and thumbnail
    if (movieCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO movies (id, title, thumbnail) VALUES ($1, $2, $3)',
        [movie_id, movie_title, thumbnail]
      );
    }

    // Insert the new review
    const newReview = await pool.query(
      'INSERT INTO reviews (user_id, movie_id, content, recommendation) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, movie_id, content, recommendation]
    );

    if (!newReview.rows || newReview.rows.length === 0) {
      throw new Error('Failed to create review');
    }

    res.status(201).json(newReview.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get reviews for a specific movie
const getReviewsByMovieId = async (req, res) => {
  const { movie_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT r.id, r.user_id, r.content, r.created_at, r.recommendation, m.thumbnail, m.title AS movie_title
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

// Get Movie by ID
const getMovieById = async (req, res) => {
  const { id } = req.params;
  console.log('Fetching movie with ID:', id);

  try {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.log('Movie not found with ID:', id);
      return res.status(404).json({ error: 'Movie not found' });
    }

    console.log('Movie found:', result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

module.exports = {
  getAllMovies,
  createReview,
  getReviewsByMovieId,
  getMovieById
};