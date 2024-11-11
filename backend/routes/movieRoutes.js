const express = require('express');
const { getAllMovies, createReview, getReviewsByMovieId, getMovieById } = require('../controllers/movieController');
const router = express.Router();

router.get('/', getAllMovies);
router.post('/reviews', createReview);
router.get('/reviews/:movie_id', getReviewsByMovieId);
router.get('/:id', getMovieById);

module.exports = router;