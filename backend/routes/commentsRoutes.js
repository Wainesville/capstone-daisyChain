const express = require('express');
const router = express.Router();
const {
    createComment,
    getCommentsByReviewId
} = require('../controllers/commentsController'); // Adjust the path if necessary

// Create a new comment for a review
router.post('/:review_id/comments', createComment);

// Fetch all comments for a specific review
router.get('/:review_id/comments', getCommentsByReviewId);

module.exports = router;
