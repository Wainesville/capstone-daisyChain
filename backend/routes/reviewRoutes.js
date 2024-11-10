const express = require('express');
const { getReviewsByUserId } = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

router.get('/user/:userId', authenticate, getReviewsByUserId);

// Define other review-related routes here...

module.exports = router;