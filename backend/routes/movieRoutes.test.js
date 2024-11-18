const request = require('supertest');
const express = require('express');
const movieRoutes = require('../routes/movieRoutes');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

const app = express();
app.use(express.json());
app.use('/movies', movieRoutes);

describe('Movie Routes', () => {
  describe('GET /movies', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Inception', genre: 'Sci-Fi', release_date: '2010-07-16', thumbnail: 'thumbnail.jpg' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockMovies });

      const response = await request(app).get('/movies');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMovies);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/movies');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch movies' });
    });
  });

  describe('POST /movies/reviews', () => {
    it('should create a new review', async () => {
      const reviewData = {
        user_id: 1,
        movie_id: 1,
        content: 'Great movie!',
        recommendation: 'Yes',
        movie_title: 'Inception',
        thumbnail: 'thumbnail.jpg',
      };
      const mockReview = {
        id: 1,
        user_id: 1,
        movie_id: 1,
        content: 'Great movie!',
        recommendation: 'Yes',
        created_at: '2023-01-01',
      };

      db.query.mockImplementation((query, values) => {
        if (query.includes('SELECT * FROM movies WHERE id = $1')) {
          return Promise.resolve({ rows: [] }); // Movie does not exist
        }
        if (query.includes('INSERT INTO movies')) {
          return Promise.resolve({ rows: [{ id: 1 }] }); // Insert movie
        }
        if (query.includes('INSERT INTO reviews')) {
          return Promise.resolve({ rows: [mockReview] }); // Insert review
        }
        return Promise.reject(new Error('Unexpected query'));
      });

      const response = await request(app).post('/movies/reviews').send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockReview);
    });

    it('should handle errors', async () => {
      const reviewData = {
        user_id: 1,
        movie_id: 1,
        content: 'Great movie!',
        recommendation: 'Yes',
        movie_title: 'Inception',
        thumbnail: 'thumbnail.jpg',
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/movies/reviews').send(reviewData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to create review' });
    });
  });

  describe('GET /movies/reviews/:movie_id', () => {
    it('should return reviews for a specific movie', async () => {
      const mockReviews = [
        { id: 1, user_id: 1, content: 'Great movie!', created_at: '2023-01-01', recommendation: 'Yes', thumbnail: 'thumbnail.jpg', movie_title: 'Inception' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockReviews });

      const response = await request(app).get('/movies/reviews/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/movies/reviews/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch reviews' });
    });
  });

  describe('GET /movies/:id', () => {
    it('should return a movie by ID', async () => {
      const mockMovie = { id: 1, title: 'Inception', genre: 'Sci-Fi', release_date: '2010-07-16', thumbnail: 'thumbnail.jpg' };
      db.query.mockResolvedValueOnce({ rows: [mockMovie] });

      const response = await request(app).get('/movies/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMovie);
    });

    it('should return 404 if movie not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/movies/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Movie not found' });
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/movies/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch movie' });
    });
  });
});