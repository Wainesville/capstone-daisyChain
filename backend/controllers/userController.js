const pool = require('../db');

// Get user profile
const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const profileResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userProfile = profileResult.rows[0];
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { profile_picture, bio, favorite_genres, top_movies } = req.body;

  try {
    const updateResult = await pool.query(
      'UPDATE users SET profile_picture = $1, bio = $2, favorite_genres = $3, top_movies = $4 WHERE id = $5 RETURNING *',
      [profile_picture, bio, favorite_genres, top_movies, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const updatedProfile = updateResult.rows[0];
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};


// Get user by username
const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Get newest users
const getNewestUsers = async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
    res.status(200).json(usersResult.rows);
  } catch (error) {
    console.error('Error fetching newest users:', error);
    res.status(500).json({ error: 'Failed to fetch newest users' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const usersResult = await pool.query('SELECT * FROM users WHERE username ILIKE $1 OR email ILIKE $1', [`%${query}%`]);
    res.status(200).json(usersResult.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserByUsername,
  getNewestUsers,
  searchUsers,
  getCurrentUser,
};