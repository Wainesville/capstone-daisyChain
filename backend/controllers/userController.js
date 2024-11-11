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

// Get User Profile
const getUserProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT u.username, u.profile_picture, u.bio, u.favorite_genres, u.top_movies, 
             ARRAY_AGG(m.*) AS top_movies_details
      FROM users u
      LEFT JOIN movies m ON m.id = ANY(u.top_movies)
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Fetched user profile:', result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};


// Update User Profile
const updateUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const { bio, favorite_genres, top_movies } = req.body;
  const profilePicture = req.file ? req.file.path : null;

  try {
    console.log('Updating user profile:', { userId, profilePicture, bio, favorite_genres, top_movies });

    // Log the received data
    console.log('Received data:', {
      bio,
      favorite_genres,
      top_movies,
      profilePicture,
    });

    // Parse favorite_genres and top_movies as arrays
    const favoriteGenresArray = Array.isArray(favorite_genres) ? favorite_genres : JSON.parse(favorite_genres);
    const topMoviesArray = Array.isArray(top_movies) ? top_movies : JSON.parse(top_movies);

    // Filter out null values from topMoviesArray
    const filteredTopMoviesArray = topMoviesArray.filter(movieId => movieId !== null);

    // Convert favorite_genres and top_movies to PostgreSQL array literals
    const favoriteGenresPgArray = favoriteGenresArray.length > 0 ? `{${favoriteGenresArray.join(',')}}` : '{}';
    const topMoviesPgArray = filteredTopMoviesArray.length > 0 ? `{${filteredTopMoviesArray.join(',')}}` : '{}';

    // Check and store movie information
    for (const movieId of filteredTopMoviesArray) {
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
      'UPDATE users SET profile_picture = $1, bio = $2, favorite_genres = $3, top_movies = $4 WHERE id = $5',
      [profilePicture, bio, favoriteGenresPgArray, topMoviesPgArray, userId]
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
};