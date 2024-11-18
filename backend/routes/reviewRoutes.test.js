const request = require('supertest');
const express = require('express');
const reviewRoutes = require('../routes/reviewRoutes');
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
app.use('/reviews', reviewRoutes);

describe('Review Routes', () => {
  describe('GET /reviews', () => {
    it('should return all reviews', async () => {
      const mockReviews = [
        { id: 1, user_id: 1, movie_id: 1, content: 'Great movie!', recommendation: 'Yes', rating: 5, created_at: '2023-01-01' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockReviews });

      const response = await request(app).get('/reviews');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/reviews');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch reviews' });
    });
  });

  describe('GET /reviews/user/:userId', () => {
    it('should return reviews by user ID', async () => {
      const mockReviews = [
        { id: 1, user_id: 1, movie_id: 1, content: 'Great movie!', recommendation: 'Yes', rating: 5, created_at: '2023-01-01' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockReviews });

      const response = await request(app).get('/reviews/user/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/reviews/user/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch reviews by user ID' });
    });
  });

  describe('GET /reviews/movie/:movieId', () => {
    it('should return reviews by movie ID', async () => {
      const mockReviews = [
        { id: 1, user_id: 1, movie_id: 1, content: 'Great movie!', recommendation: 'Yes', rating: 5, created_at: '2023-01-01' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockReviews });

      const response = await request(app).get('/reviews/movie/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/reviews/movie/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch reviews by movie ID' });
    });
  });

  describe('GET /reviews/:reviewId/likes', () => {
    it('should return likes for a review', async () => {
      const mockLikes = { likes: 10 };
      db.query.mockResolvedValueOnce({ rows: [mockLikes] });

      const response = await request(app).get('/reviews/1/likes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLikes);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/reviews/1/likes');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch likes for review' });
    });
  });

  describe('GET /reviews/:reviewId/comments', () => {
    it('should return comments for a review', async () => {
      const mockComments = [
        { id: 1, review_id: 1, user_id: 1, content: 'Great review!', created_at: '2023-01-01' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockComments });

      const response = await request(app).get('/reviews/1/comments');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments);
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/reviews/1/comments');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch comments for review' });
    });
  });

  describe('POST /reviews/:reviewId/like', () => {
    it('should like a review', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).post('/reviews/1/like');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Review liked successfully' });
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/reviews/1/like');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to like review' });
    });
  });

  describe('DELETE /reviews/:reviewId/like', () => {
    it('should unlike a review', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app).delete('/reviews/1/like');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Review unliked successfully' });
    });

    it('should handle errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).delete('/reviews/1/like');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to unlike review' });
    });
  });

  describe('POST /reviews', () => {
    it('should create a new review', async () => {
      const reviewData = {
        user_id: 1,
        movie_id: 1,
        content: 'Great movie!',
        recommendation: 'Yes',
        rating: 5,
        movie_title: 'Inception',
        thumbnail: 'thumbnail.jpg',
      };
      const mockReview = {
        id: 1,
        user_id: 1,
        movie_id: 1,
        content: 'Great movie!',
        recommendation: 'Yes',
        rating: 5,
        movie_title: 'Inception',
        thumbnail: 'thumbnail.jpg',
        created_at: '2023-01-01',
      };
      db.query.mockResolvedValueOnce({ rows: [mockReview] });

      const response = await request(app).post('/reviews').send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockReview);
    });

    it('should handle errors', async () => {
      const reviewData = {
        user_id: 1,
        movie_id: 1,
        content: 'Great movie!',
        recommendation: 'Yes',
        rating: 5,
        movie_title: 'Inception',
        thumbnail: 'thumbnail.jpg',
      };
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/reviews').send(reviewData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to create review' });
    });
  });
});