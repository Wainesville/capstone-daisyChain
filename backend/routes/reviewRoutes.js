const express = require('express');
const { createReview, getAllReviews, getReviewsByUserId, getReviewsByMovieId, getLikesForReview, getCommentsForReview, likeReview, unlikeReview } = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

router.post('/', authenticate, createReview); // Create a review
router.get('/', getAllReviews); // Get all reviews
router.get('/user/:userId', authenticate, getReviewsByUserId); // Get reviews by user ID
router.get('/movie/:movieId', getReviewsByMovieId); // Get reviews by movie ID
router.get('/:reviewId/likes', getLikesForReview); // Get likes for a review
router.get('/:reviewId/comments', getCommentsForReview); // Get comments for a review
router.post('/:reviewId/like', authenticate, likeReview); // Like a review
router.delete('/:reviewId/unlike', authenticate, unlikeReview); // Unlike a review

module.exports = router;