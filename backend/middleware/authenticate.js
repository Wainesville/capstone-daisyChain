const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('No Authorization header found');
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token received:', token);

  if (!token) {
    console.log('No token found after replacing Bearer');
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (ex) {
    console.log('Invalid token:', ex.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
};

module.exports = authenticate;