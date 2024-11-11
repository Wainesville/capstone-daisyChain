const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { addRecommendation, getRecommendations } = require('../controllers/recommendationController');

router.post('/add', authenticate, addRecommendation);
router.get('/', authenticate, getRecommendations);

module.exports = router;