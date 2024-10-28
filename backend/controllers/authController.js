const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register User
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if user exists by either username or email
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username or Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send the token and user object back with a status of 200
    return res.status(200).json({ token, user: user.rows[0] }); // Ensure correct response format
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  registerUser,
  loginUser,
};
