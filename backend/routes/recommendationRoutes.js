const express = require('express');
const router = express.Router();
const { getRecommendations, addRecommendation } = require('../controllers/recommendationController');

// Get Recommendations
router.get('/', getRecommendations);

// Add a new recommendation
router.post('/', addRecommendation);

module.exports = router;