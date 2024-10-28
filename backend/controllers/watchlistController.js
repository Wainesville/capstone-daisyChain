const pool = require('../db');

// Get Watchlist for Logged-in User
const getWatchlist = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }

    try {
        const result = await pool.query('SELECT * FROM watchlist WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add Movie to Watchlist
const addToWatchlist = async (req, res) => {
    const userId = req.userId;
    const { movieId, title, poster } = req.body; // Expect title and poster
  
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }
  
    if (!movieId || !title || !poster) {
      return res.status(400).json({ error: 'movieId, title, and poster are required' });
    }
  
    try {
      const existingMovie = await pool.query('SELECT * FROM watchlist WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
      if (existingMovie.rows.length > 0) {
        return res.status(400).json({ error: 'Movie is already in watchlist' });
      }
  
      await pool.query(
        'INSERT INTO watchlist (user_id, movie_id, title, poster) VALUES ($1, $2, $3, $4)',
        [userId, movieId, title, poster]
      );
      res.status(201).json({ message: 'Movie added to watchlist' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
// Remove Movie from Watchlist
const removeFromWatchlist = async (req, res) => {
    const userId = req.userId;
    const movieId = req.params.movieId; // Expecting movieId from the request parameters

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }

    if (!movieId) {
        return res.status(400).json({ error: 'movieId is required' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Movie not found in watchlist' });
        }

        res.status(200).json({ message: 'Movie removed from watchlist' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
};
