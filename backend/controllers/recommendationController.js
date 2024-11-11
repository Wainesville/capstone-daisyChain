const pool = require('../db');
const axios = require('axios');

// Add a movie to recommendations
const addRecommendation = async (req, res) => {
  const userId = req.user.userId;
  const { movieId, title, poster, logo } = req.body;

  try {
    // Check the current number of recommendations
    const recommendations = await pool.query('SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at ASC', [userId]);

    if (recommendations.rows.length >= 5) {
      // Remove the oldest recommendation if there are already 5
      const oldestRecommendation = recommendations.rows[0];
      await pool.query('DELETE FROM recommendations WHERE id = $1', [oldestRecommendation.id]);
    }

    // Add the new recommendation
    await pool.query(
      'INSERT INTO recommendations (user_id, movie_id, title, poster, logo) VALUES ($1, $2, $3, $4, $5)',
      [userId, movieId, title, poster, logo]
    );

    res.status(200).json({ message: 'Recommendation added successfully' });
  } catch (err) {
    console.error('Error adding recommendation:', err);
    res.status(500).json({ error: 'Failed to add recommendation' });
  }
};

// Get recommendations for a user
const getRecommendations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const recommendations = await pool.query('SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.status(200).json(recommendations.rows);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

module.exports = {
  addRecommendation,
  getRecommendations,
};