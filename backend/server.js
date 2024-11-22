const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Middleware for handling file uploads
const authenticate = require('./middleware/authenticate'); // Adjust path if needed
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// File upload configuration with multer (for profile picture handling)
const upload = multer({ dest: 'uploads/' }); // You can customize this path

// Import Routes
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlistRoutes');
const movieRoutes = require('./routes/movieRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const userRoutes = require('./routes/userRoutes'); // Ensure userRoutes is imported
const recommendationRoutes = require('./routes/recommendationRoutes'); // Add this line

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', authenticate, watchlistRoutes); // Ensure authentication middleware is used
app.use('/api/movies', movieRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', userRoutes); // Ensure userRoutes is used
app.use('/api/recommendations', authenticate, recommendationRoutes); // Add this line

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});