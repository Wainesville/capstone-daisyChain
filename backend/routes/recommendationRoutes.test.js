const request = require('supertest');
const express = require('express');
const nock = require('nock');
const recommendationRoutes = require('../routes/recommendationRoutes');
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
app.use('/recommendations', recommendationRoutes);

describe('Recommendation Routes', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('POST /recommendations/add', () => {
    it('should add a recommendation', async () => {
      const recommendationData = {
        movieId: 1,
        recommendedBy: 1,
        recommendedTo: 2,
      };

      // Mock the external API call
      nock('https://api.themoviedb.org')
        .get('/3/movie/1')
        .query({ api_key: '8feb4db25b7185d740785fc6b6f0e850' })
        .reply(200, { id: 1, title: 'Inception' });

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app).post('/recommendations/add').send(recommendationData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Recommendation added successfully' });
    });

    it('should handle errors', async () => {
      const recommendationData = {
        movieId: 1,
        recommendedBy: 1,
        recommendedTo: 2,
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/recommendations/add').send(recommendationData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to add recommendation' });
    });
  });
});