const pool = require('../db');

// Get user by username
const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
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
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching newest users:', error);
    res.status(500).json({ error: 'Failed to fetch newest users' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username ILIKE $1', [`%${query}%`]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { profilePicture, bio, favorite_genres, top_movies, recommendations } = req.body;

  try {
    const result = await pool.query(
      'UPDATE user_profiles SET profile_picture = $1, bio = $2, favorite_genres = $3, top_movies = $4, recommendations = $5 WHERE user_id = $6 RETURNING *',
      [profilePicture, bio, favorite_genres, top_movies, recommendations, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};


// Get current user
const getCurrentUser = async (req, res) => {
  const userId = req.user.userId; // Ensure this matches the decoded token structure
  console.log('Fetching user with ID:', userId);

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    console.log('User found:', user);
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


module.exports = {
  getUserByUsername,
  getNewestUsers,
  searchUsers,
  getUserProfile,
  updateUserProfile,
  getCurrentUser,
};