const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const authenticate = require('../middleware/authenticate');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

jest.mock('../middleware/authenticate', () => {
  return (req, res, next) => {
    req.user = { userId: 1 };
    next();
  };
});

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Routes', () => {
  describe('GET /users/profile', () => {
    it('should return user profile data', async () => {
      const mockProfile = { user_id: 1, bio: 'Test bio', profile_picture: 'path/to/pic' };
      db.query.mockResolvedValueOnce({ rows: [mockProfile] });

      const response = await request(app).get('/users/profile');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/users/profile');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch user profile' });
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile', async () => {
      const profileData = {
        profilePicture: 'path/to/new/pic',
        bio: 'New bio',
        favorite_genres: '["Action", "Comedy"]',
        top_movies: '[1, 2]',
        recommendations: '[3, 4]',
      };
      const mockProfile = {
        user_id: 1,
        profile_picture: 'path/to/new/pic',
        bio: 'New bio',
        favorite_genres: '["Action", "Comedy"]',
        top_movies: '[1, 2]',
        recommendations: '[3, 4]',
      };
      db.query.mockResolvedValueOnce({ rows: [mockProfile] });

      const response = await request(app).put('/users/profile').send(profileData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Profile updated successfully' });
    });

    it('should handle errors', async () => {
      const profileData = {
        profilePicture: 'path/to/new/pic',
        bio: 'New bio',
        favorite_genres: '["Action", "Comedy"]',
        top_movies: '[1, 2]',
        recommendations: '[3, 4]',
      };
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).put('/users/profile').send(profileData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update user profile' });
    });
  });
describe('GET /users/newest', () => {
    it('should return newest users', async () => {
        const mockUsers = [
            { id: 1, username: 'user1', created_at: '2023-01-01' },
            { id: 2, username: 'user2', created_at: '2023-01-02' },
        ];
        db.query.mockResolvedValueOnce({ rows: mockUsers });

        const response = await request(app).get('/users/newest');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers);
    });

    it('should handle errors', async () => {
        db.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/users/newest');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to fetch newest users' });
    });
});

describe('GET /users/search', () => {
    it('should return search results', async () => {
        const mockUsers = [
            { id: 1, username: 'user1' },
            { id: 2, username: 'user2' },
        ];
        db.query.mockResolvedValueOnce({ rows: mockUsers });

        const response = await request(app).get('/users/search').query({ query: 'user' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers);
    });

    it('should handle errors', async () => {
        db.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/users/search').query({ query: 'user' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to search users' });
    });
});

describe('GET /users/:username', () => {
    it('should return user data by username', async () => {
        const mockUser = { id: 1, username: 'user1' };
        db.query.mockResolvedValueOnce({ rows: [mockUser] });

        const response = await request(app).get('/users/user1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get('/users/nonexistentuser');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should handle errors', async () => {
        db.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/users/user1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to fetch user data' });
    });
});

  // Add more tests for other routes as needed
});