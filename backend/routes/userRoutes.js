const express = require('express');
const authenticate = require('../middleware/authenticate');
const { getUserByUsername } = require('../controllers/userController');

const router = express.Router();

router.get('/:username', authenticate, getUserByUsername);

module.exports = router;