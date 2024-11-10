const db = require('../db'); // Ensure this is your actual database connection

// Get Recommendations
const getRecommendations = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM recommendations');
    if (result.rows.length === 0) {
      return res.status(200).json([]); // Return an empty array if no recommendations are found
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

// Add a new recommendation
const addRecommendation = async (req, res) => {
  const { user_id, title, content } = req.body;

  if (!user_id || !title || !content) {
    return res.status(400).json({ error: 'Missing required fields: user_id, title, content' });
  }

  try {
    const result = await db.query(
      'INSERT INTO recommendations (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding recommendation:', error);
    res.status(500).json({ error: 'Failed to add recommendation' });
  }
};

module.exports = {
  getRecommendations,
  addRecommendation,
};