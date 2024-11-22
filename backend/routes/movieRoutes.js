const express = require('express');
const { getAllMovies, getReviewsByMovieId, getMovieById } = require('../controllers/movieController');
const router = express.Router();

router.get('/', getAllMovies);
router.get('/reviews/:movie_id', getReviewsByMovieId);
router.get('/:id', getMovieById);

module.exports = router;