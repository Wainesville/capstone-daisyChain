const express = require('express');
const { getWatchlistByUserId, getWatchlist, addToWatchlist, removeFromWatchlist, setCurrentlyWatching, setNextUp } = require('../controllers/watchlistController');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

router.get('/', authenticate, getWatchlist);
router.post('/add', authenticate, addToWatchlist);
router.delete('/remove/:movieId', authenticate, removeFromWatchlist);
router.put('/currently-watching/:movieId', authenticate, setCurrentlyWatching);
router.put('/next-up/:movieId', authenticate, setNextUp);
router.get('/:userId', authenticate, getWatchlistByUserId); // Add the route to fetch the user's watchlist by user ID

module.exports = router;