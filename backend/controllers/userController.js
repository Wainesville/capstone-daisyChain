const pool = require('../db');
const axios = require('axios'); // Import axios

// Get User by Username
const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

const getNewestUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, profile_picture FROM users ORDER BY id DESC LIMIT 10');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching newest users:', err);
    res.status(500).json({ error: 'Failed to fetch newest users' });
  }
};

// Search users by username
const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const result = await pool.query('SELECT id, username, profile_picture FROM users WHERE username ILIKE $1', [`%${query}%`]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT u.username, u.profile_picture, u.bio, u.favorite_genres, u.top_movies, u.recommendations,
             ARRAY_AGG(m.*) AS top_movies_details,
             ARRAY_AGG(r.*) AS recommendations_details
      FROM users u
      LEFT JOIN movies m ON m.id = ANY(u.top_movies)
      LEFT JOIN movies r ON r.id = ANY(u.recommendations)
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const { bio, favorite_genres, top_movies, recommendations } = req.body;
  const profilePicture = req.file ? req.file.path : null;

  try {
    console.log('Updating user profile:', { userId, profilePicture, bio, favorite_genres, top_movies, recommendations });

    // Log the received data
    console.log('Received data:', {
      bio,
      favorite_genres,
      top_movies,
      recommendations,
      profilePicture,
    });

    // Parse favorite_genres, top_movies, and recommendations as arrays
    const favoriteGenresArray = Array.isArray(favorite_genres) ? favorite_genres : JSON.parse(favorite_genres);
    const topMoviesArray = Array.isArray(top_movies) ? top_movies : JSON.parse(top_movies);
    const recommendationsArray = Array.isArray(recommendations) ? recommendations : JSON.parse(recommendations);

    // Filter out null values from topMoviesArray and recommendationsArray
    const filteredTopMoviesArray = topMoviesArray.filter(movieId => movieId !== null);
    const filteredRecommendationsArray = recommendationsArray.filter(movieId => movieId !== null);

    // Convert favorite_genres, top_movies, and recommendations to PostgreSQL array literals
    const favoriteGenresPgArray = favoriteGenresArray.length > 0 ? `{${favoriteGenresArray.join(',')}}` : '{}';
    const topMoviesPgArray = filteredTopMoviesArray.length > 0 ? `{${filteredTopMoviesArray.join(',')}}` : '{}';
    const recommendationsPgArray = filteredRecommendationsArray.length > 0 ? `{${filteredRecommendationsArray.join(',')}}` : '{}';

    // Check and store movie information
    for (const movieId of [...filteredTopMoviesArray, ...filteredRecommendationsArray]) {
      if (movieId) {
        const movieCheck = await pool.query('SELECT * FROM movies WHERE id = $1', [movieId]);

        // If the movie doesn't exist, fetch and insert it
        if (movieCheck.rows.length === 0) {
          const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            params: {
              api_key: '8feb4db25b7185d740785fc6b6f0e850',
            },
          });
          const movie = movieResponse.data;
          const posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          await pool.query(
            'INSERT INTO movies (id, title, thumbnail, logo) VALUES ($1, $2, $3, $4)',
            [movie.id, movie.title, posterPath, movie.logo]
          );
        } else {
          // If the movie exists, check and update if necessary
          const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            params: {
              api_key: '8feb4db25b7185d740785fc6b6f0e850',
            },
          });
          const movie = movieResponse.data;
          const posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          const existingMovie = movieCheck.rows[0];

          if (existingMovie.title !== movie.title || existingMovie.thumbnail !== posterPath || existingMovie.logo !== movie.logo) {
            await pool.query(
              'UPDATE movies SET title = $1, thumbnail = $2, logo = $3 WHERE id = $4',
              [movie.title, posterPath, movie.logo, movieId]
            );
          }
        }
      }
    }

    await pool.query(
      'UPDATE users SET profile_picture = $1, bio = $2, favorite_genres = $3, top_movies = $4, recommendations = $5 WHERE id = $6',
      [profilePicture, bio, favoriteGenresPgArray, topMoviesPgArray, recommendationsPgArray, userId]
    );
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

module.exports = {
  getUserByUsername,
  getUserProfile,
  updateUserProfile,
  getNewestUsers, // Export the getNewestUsers function
  searchUsers,
};