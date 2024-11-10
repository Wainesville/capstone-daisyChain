const pool = require('../db');

// Get Watchlist for Logged-in User
const getWatchlist = async (req, res) => {
  const userId = req.user.userId;

  if (!userId) {
    return res.status(403).json({ error: 'Access denied. No user ID provided.' });
  }

  try {
    const result = await pool.query('SELECT * FROM watchlist WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};

// Add Movie to Watchlist
const addToWatchlist = async (req, res) => {
  const userId = req.user.userId;
  const { movieId, title, poster } = req.body;

  if (!userId) {
    return res.status(403).json({ error: 'Access denied. No user ID provided.' });
  }

  console.log('Adding to watchlist:', { userId, movieId, title, poster });

  try {
    // Check if the movie exists in the movies table
    const movieExists = await pool.query('SELECT * FROM movies WHERE id = $1', [movieId]);
    if (movieExists.rows.length === 0) {
      // Insert the movie into the movies table if it doesn't exist
      await pool.query(
        'INSERT INTO movies (id, title, poster) VALUES ($1, $2, $3)',
        [movieId, title, poster]
      );
    }

    // Insert the movie into the watchlist table
    await pool.query(
      'INSERT INTO watchlist (user_id, movie_id, title, poster) VALUES ($1, $2, $3, $4)',
      [userId, movieId, title, poster]
    );
    res.status(201).json({ message: 'Movie added to watchlist' });
  } catch (err) {
    console.error('Error adding to watchlist:', err);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
};

// Remove Movie from Watchlist
const removeFromWatchlist = async (req, res) => {
  const userId = req.user.userId;
  const { movieId } = req.params;

  if (!userId) {
    return res.status(403).json({ error: 'Access denied. No user ID provided.' });
  }

  console.log('Removing from watchlist:', { userId, movieId });

  try {
    await pool.query('DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    res.status(200).json({ message: 'Movie removed from watchlist' });
  } catch (err) {
    console.error('Error removing from watchlist:', err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
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
    await pool.query('UPDATE watchlist SET currently_watching = true WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);

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
    await pool.query('UPDATE watchlist SET next_up = true WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);

    res.status(200).json({ message: 'Next up updated' });
  } catch (err) {
    console.error('Error setting next up:', err);
    res.status(500).json({ error: 'Failed to set next up' });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  setCurrentlyWatching,
  setNextUp,
};