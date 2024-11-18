const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
      };
      const hashedPassword = 'hashedpassword123';
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: hashedPassword,
      };

      bcrypt.hash.mockResolvedValueOnce(hashedPassword);
      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User registered successfully' });
    });

    it('should handle errors', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
      };
      const hashedPassword = 'hashedpassword123';
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: hashedPassword,
      };
      const token = 'jsonwebtoken';

      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce(token);

      const response = await request(app).post('/auth/login').send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token, user: { id: mockUser.id, username: mockUser.username } });
    });

    it('should handle invalid credentials', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
      };

      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).post('/auth/login').send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should handle errors', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/auth/login').send(userData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });
});