const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { addRecommendation } = require('../controllers/recommendationController');

router.post('/add', authenticate, addRecommendation);

module.exports = router;