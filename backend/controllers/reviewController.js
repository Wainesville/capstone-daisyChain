const pool = require('../db');

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

// Add other review-related functions here...

module.exports = {
  getReviewsByUserId,
  // Export other functions here...
};