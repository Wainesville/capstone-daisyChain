const pool = require('../db');

// Get Watchlist for Logged-in User
const getWatchlist = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query('SELECT * FROM watchlist WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};


const addToWatchlist = async (req, res) => {
  const { movieId, title, poster } = req.body;

  // Validate required fields
  if (!movieId || !title || !poster) {
    console.error('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Insert movie into the watchlist
    const result = await pool.query(
      'INSERT INTO watchlist (movie_id, title, poster, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
      [movieId, title, poster]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to add movie to watchlist');
    }

    res.status(201).json({ message: 'Movie added to watchlist successfully' });
  } catch (err) {
    console.error('Error adding movie to watchlist:', err);
    res.status(500).json({ error: 'Failed to add movie to watchlist' });
  }
};

// Remove Movie from Watchlist
const removeFromWatchlist = async (req, res) => {
  const userId = req.user.userId;
  const { movieId } = req.params;

  try {
    await pool.query('DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    res.status(200).json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Error removing movie from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove movie from watchlist' });
  }
};

// Set Currently Watching
const setCurrentlyWatching = async (req, res) => {
  const userId = req.user.userId;
  const { movieId } = req.params;

  try {
    // Reset currently watching for all movies
    await pool.query('UPDATE watchlist SET currently_watching = false WHERE user_id = $1', [userId]);

    // Set currently watching for the selected movie
    await pool.query('UPDATE watchlist SET currently_watching = true, "order" = 1 WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);

    // Update the order of other movies
    await pool.query('UPDATE watchlist SET "order" = "order" + 1 WHERE user_id = $1 AND movie_id != $2', [userId, movieId]);

    res.status(200).json({ message: 'Currently watching updated' });
  } catch (err) {
    console.error('Error setting currently watching:', err);
    res.status(500).json({ error: 'Failed to set currently watching' });
  }
};

// Set Next Up
const setNextUp = async (req, res) => {
  const userId = req.user.userId;
  const { movieId } = req.params;

  try {
    // Reset next up for all movies
    await pool.query('UPDATE watchlist SET next_up = false WHERE user_id = $1', [userId]);

    // Set next up for the selected movie
    await pool.query('UPDATE watchlist SET next_up = true, "order" = 2 WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);

    // Update the order of other movies
    await pool.query('UPDATE watchlist SET "order" = "order" + 1 WHERE user_id = $1 AND movie_id != $2 AND "order" >= 2', [userId, movieId]);

    res.status(200).json({ message: 'Next up updated' });
  } catch (err) {
    console.error('Error setting next up:', err);
    res.status(500).json({ error: 'Failed to set next up' });
  }
};


// Fetch watchlist by user ID
const getWatchlistByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query('SELECT * FROM watchlist WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};


module.exports = {
  getWatchlist,
  addToWatchlist,
  getWatchlistByUserId,
  removeFromWatchlist,
  setCurrentlyWatching,
  setNextUp,
};