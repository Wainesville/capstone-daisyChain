const pool = require('../db');
const axios = require('axios');

const addRecommendation = async (req, res) => {
  const { movieId, recommendedBy, recommendedTo } = req.body;

  try {
    // Fetch movie details from external API
    const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: { api_key: '8feb4db25b7185d740785fc6b6f0e850' },
    });

    const movie = movieResponse.data;

    // Insert recommendation into the database
    const result = await pool.query(
      'INSERT INTO recommendations (movie_id, recommended_by, recommended_to, movie_title) VALUES ($1, $2, $3, $4) RETURNING *',
      [movieId, recommendedBy, recommendedTo, movie.title]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to add recommendation');
    }

    res.status(201).json({ message: 'Recommendation added successfully' });
  } catch (err) {
    console.error('Error adding recommendation:', err);
    res.status(500).json({ error: 'Failed to add recommendation' });
  }
};

module.exports = {
  addRecommendation,
};