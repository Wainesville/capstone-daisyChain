const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('./authController');
const pool = require('../db');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../db', () => ({
  query: jest.fn(),
}));

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const req = {
        body: {
          username: 'newUser',
          email: 'newuser@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce({ rows: [] }); // No existing user
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');

      await registerUser(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        ['newUser', 'newuser@example.com']
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
        ['newUser', 'newuser@example.com', 'hashedPassword']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should return an error if the username or email already exists', async () => {
      const req = {
        body: {
          username: 'existingUser',
          email: 'existinguser@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Existing user

      await registerUser(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        ['existingUser', 'existinguser@example.com']
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username or Email already exists' });
    });
  });

  describe('loginUser', () => {
    it('should return a token and user data on valid login', async () => {
      const req = {
        body: {
          email: 'validuser@example.com',
          password: 'validPassword',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: 'validUser',
            email: 'validuser@example.com',
            password: 'hashedPassword',
          },
        ],
      });
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValue('token');

      await loginUser(req, res);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['validuser@example.com']);
      expect(bcrypt.compare).toHaveBeenCalledWith('validPassword', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: 'token',
        user: { id: 1, username: 'validUser', email: 'validuser@example.com' },
      });
    });

    it('should return an error on invalid login', async () => {
      const req = {
        body: {
          email: 'invaliduser@example.com',
          password: 'invalidPassword',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockResolvedValueOnce({ rows: [] }); // No user found

      await loginUser(req, res);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['invaliduser@example.com']);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });
});