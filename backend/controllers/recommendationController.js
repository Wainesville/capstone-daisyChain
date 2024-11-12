const pool = require('../db');
const axios = require('axios');

// Add a movie to recommendations
const addRecommendation = async (req, res) => {
  const userId = req.user.userId;
  const { movieId, title, poster, logo } = req.body;

  try {
    // Check if the movie already exists in the movies table
    const movieCheck = await pool.query('SELECT * FROM movies WHERE id = $1', [movieId]);

    // If the movie doesn't exist, fetch and insert it
    if (movieCheck.rows.length === 0) {
      const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: {
          api_key: '8feb4db25b7185d740785fc6b6f0e850',
        },
      });
      const movie = movieResponse.data;
      const posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      await pool.query(
        'INSERT INTO movies (id, title, thumbnail, logo) VALUES ($1, $2, $3, $4)',
        [movie.id, movie.title, posterPath, movie.logo]
      );
    }

    // Fetch the user's current recommendations
    const userResponse = await pool.query('SELECT recommendations FROM users WHERE id = $1', [userId]);
    const currentRecommendations = userResponse.rows[0].recommendations || [];

    // Add the new recommendation, ensuring the list doesn't exceed 5 items
    const updatedRecommendations = [...currentRecommendations, movieId].slice(-5);

    // Update the user's recommendations
    await pool.query(
      'UPDATE users SET recommendations = $1 WHERE id = $2',
      [updatedRecommendations, userId]
    );

    res.status(200).json({ message: 'Recommendation added successfully' });
  } catch (err) {
    console.error('Error adding recommendation:', err);
    res.status(500).json({ error: 'Failed to add recommendation' });
  }
};

module.exports = {
  addRecommendation,
};