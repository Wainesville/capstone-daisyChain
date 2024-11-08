const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Middleware for handling file uploads
const authenticate = require('./middleware/authenticate'); // Adjust path if needed
require('dotenv').config();

const app = express();
const port =5000;

app.use(cors());
app.use(express.json());

// File upload configuration with multer (for profile picture handling)
const upload = multer({ dest: 'uploads/' }); // You can customize this path

// Import Routes
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
const movieRoutes = require('./routes/movieRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', authenticate, watchlistRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentsRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
