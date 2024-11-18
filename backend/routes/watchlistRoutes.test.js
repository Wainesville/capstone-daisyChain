const request = require('supertest');
const express = require('express');
const watchlistRoutes = require('../routes/watchlistRoutes');
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
app.use('/watchlist', watchlistRoutes);

describe('Watchlist Routes', () => {
  describe('GET /watchlist', () => {
    it('should return the watchlist for the logged-in user', async () => {
      const mockWatchlist = [
        { user_id: 1, movie_id: 1, title: 'Inception', poster: 'poster.jpg' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockWatchlist });

      const response = await request(app).get('/watchlist');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockWatchlist);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/watchlist');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch watchlist' });
    });
  });

  describe('POST /watchlist/add', () => {
    it('should add a movie to the watchlist', async () => {
      const movieData = {
        movieId: 1,
        title: 'Inception',
        poster: 'poster.jpg',
        logo: 'logo.jpg',
      };
      db.query.mockResolvedValueOnce({ rows: [] }); // Movie does not exist
      db.query.mockResolvedValueOnce({ rows: [] }); // Insert movie
      db.query.mockResolvedValueOnce({ rows: [] }); // Add to watchlist

      const response = await request(app).post('/watchlist/add').send(movieData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Movie added to watchlist' });
    });

    it('should handle errors', async () => {
      const movieData = {
        movieId: 1,
        title: 'Inception',
        poster: 'poster.jpg',
        logo: 'logo.jpg',
      };
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/watchlist/add').send(movieData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to add movie to watchlist' });
    });
  });

  // Add more tests for other routes as needed
});