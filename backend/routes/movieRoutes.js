const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection

// Get movie suggestions based on a query
router.get('/', async (req, res) => {
  const { query } = req.query; // Get the search query from the request

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Query the database to find movies that match the search term (case-insensitive)
    const result = await pool.query(
      'SELECT id, title FROM movies WHERE LOWER(title) LIKE $1 LIMIT 10',
      [`%${query.toLowerCase()}%`]
    );

    res.json(result.rows); // Send back the movie suggestions
  } catch (err) {
    console.error('Error fetching movie suggestions:', err);
    res.status(500).json({ error: 'Failed to fetch movie suggestions' });
  }
});

module.exports = router;
