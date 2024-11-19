const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { addRecommendation, removeRecommendation } = require('../controllers/recommendationController');

router.post('/add', authenticate, addRecommendation);
router.post('/remove', authenticate, removeRecommendation);

module.exports = router;