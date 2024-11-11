const express = require('express');
const { getUserByUsername, getUserProfile, updateUserProfile } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate'); // Authentication middleware
const multer = require('multer'); // Middleware for handling file uploads

const upload = multer({ dest: 'uploads/' }); // Configure multer for file uploads
const router = express.Router();

router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, upload.single('profile_picture'), updateUserProfile);
router.get('/:username', getUserByUsername);

module.exports = router;