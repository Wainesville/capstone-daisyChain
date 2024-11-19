const pool = require('../db');
const axios = require('axios');

const addRecommendation = async (req, res) => {
  const { movieId, userId, title, content } = req.body;

  // Validate required fields
  if (!movieId || !userId || !title || !content) {
    console.error('Missing required fields:', { movieId, userId, title, content });
    return res.status(400).json({ error: 'Missing required fields', fields: { movieId, userId, title, content } });
  }

  try {
    // Check if the recommendation already exists
    const existingRecommendation = await pool.query(
      'SELECT * FROM recommendations WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );

    if (existingRecommendation.rows.length > 0) {
      return res.status(400).json({ error: 'Recommendation already exists' });
    }

    // Fetch movie details from external API
    const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: { api_key: '8feb4db25b7185d740785fc6b6f0e850' },
    });

    const movie = movieResponse.data;

    // Check if the movie exists in the database
    const movieCheck = await pool.query('SELECT * FROM movies WHERE id = $1', [movieId]);

    // If the movie doesn't exist, insert it with title and thumbnail
    if (movieCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO movies (id, title, thumbnail) VALUES ($1, $2, $3)',
        [movieId, movie.title, `https://image.tmdb.org/t/p/w500/${movie.poster_path}`]
      );
    }

    // Insert recommendation into the database
    const result = await pool.query(
      'INSERT INTO recommendations (user_id, movie_id, title, content, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
      [userId, movieId, title, content]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to add recommendation');
    }

    // Update the user's recommendations in the users table
    await pool.query(
      'UPDATE users SET recommendations = array_append(recommendations, $1) WHERE id = $2',
      [movieId, userId]
    );

    res.status(201).json({ message: 'Recommendation added successfully' });
  } catch (err) {
    console.error('Error adding recommendation:', err);
    res.status(500).json({ error: 'Failed to add recommendation' });
  }
};

const removeRecommendation = async (req, res) => {
  const { movieId, userId } = req.body;

  // Validate required fields
  if (!movieId || !userId) {
    console.error('Missing required fields:', { movieId, userId });
    return res.status(400).json({ error: 'Missing required fields', fields: { movieId, userId } });
  }

  try {
    console.log('Attempting to remove recommendation for user:', userId, 'and movie:', movieId);

    // Remove recommendation from the database
    const result = await pool.query(
      'DELETE FROM recommendations WHERE user_id = $1 AND movie_id = $2 RETURNING *',
      [userId, movieId]
    );

    if (result.rows.length === 0) {
      console.log('Recommendation not found in recommendations table for user:', userId, 'and movie:', movieId);
    } else {
      console.log('Recommendation removed from recommendations table:', result.rows[0]);
    }

    // Update the user's recommendations in the users table
    const updateResult = await pool.query(
      'UPDATE users SET recommendations = array_remove(recommendations, $1) WHERE id = $2 RETURNING *',
      [movieId, userId]
    );

    if (updateResult.rows.length === 0) {
      throw new Error('Failed to update user recommendations');
    }

    console.log('User recommendations updated successfully for user:', userId);
    res.status(200).json({ message: 'Recommendation removed successfully' });
  } catch (err) {
    console.error('Error removing recommendation:', err);
    res.status(500).json({ error: 'Failed to remove recommendation' });
  }
};

module.exports = {
  addRecommendation,
  removeRecommendation,
};