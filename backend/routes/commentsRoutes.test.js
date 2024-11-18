const request = require('supertest');
const express = require('express');
const commentsRoutes = require('../routes/commentsRoutes');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

const app = express();
app.use(express.json());
app.use('/reviews', commentsRoutes);

describe('Comments Routes', () => {
  describe('POST /reviews/:review_id/comments', () => {
    it('should create a new comment', async () => {
      const commentData = {
        user_id: 1,
        content: 'Great review!',
      };
      const mockComment = {
        id: 1,
        review_id: 1,
        user_id: 1,
        content: 'Great review!',
        created_at: '2023-01-01',
      };

      db.query.mockResolvedValueOnce({ rows: [mockComment] });

      const response = await request(app).post('/reviews/1/comments').send(commentData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockComment);
    });

    it('should handle errors', async () => {
      const commentData = {
        user_id: 1,
        content: 'Great review!',
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/reviews/1/comments').send(commentData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to post comment' });
    });
  });

  describe('GET /reviews/:review_id/comments', () => {
    it('should return comments for a specific review', async () => {
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
      expect(response.body).toEqual({ error: 'Failed to fetch comments' });
    });
  });
});