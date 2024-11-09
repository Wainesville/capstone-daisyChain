const express = require('express');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const router = express.Router();

const authenticate = require('../middleware/authenticate'); // Authentication middleware

// Get Watchlist Route
router.get('/', authenticate, getWatchlist);

// Add Movie to Watchlist Route
router.post('/add', authenticate, addToWatchlist);

// Remove Movie from Watchlist Route (changed to DELETE)
router.delete('/remove/:movieId', authenticate, removeFromWatchlist); // Use a DELETE request and expect movieId as a URL parameter

module.exports = router;
