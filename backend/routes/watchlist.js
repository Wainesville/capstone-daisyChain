const express = require('express');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

router.get('/', authenticate, getWatchlist);
router.post('/add', authenticate, addToWatchlist);
router.delete('/remove/:movieId', authenticate, removeFromWatchlist);

module.exports = router;