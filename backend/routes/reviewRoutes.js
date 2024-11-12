const express = require('express');
const {
  getAllReviews,
  getReviewsByUserId,
  getReviewsByMovieId,
  getLikesForReview,
  getCommentsForReview,
  likeReview,
  unlikeReview,
  createReview
} = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

router.get('/', getAllReviews);
router.get('/user/:userId', authenticate, getReviewsByUserId);
router.get('/movie/:movieId', getReviewsByMovieId);
router.get('/:reviewId/likes', getLikesForReview);
router.get('/:reviewId/comments', getCommentsForReview);
router.post('/:reviewId/like', authenticate, likeReview);
router.delete('/:reviewId/like', authenticate, unlikeReview);
router.post('/', authenticate, createReview);

module.exports = router;