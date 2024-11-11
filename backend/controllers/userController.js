const pool = require('../db');

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

    // Convert favorite_genres and top_movies to PostgreSQL array literals
    const favoriteGenresPgArray = favoriteGenresArray.length > 0 ? `{${favoriteGenresArray.join(',')}}` : '{}';
    const topMoviesPgArray = topMoviesArray.length > 0 ? `{${topMoviesArray.join(',')}}` : '{}';

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