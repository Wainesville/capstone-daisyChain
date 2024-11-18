const request = require('supertest');
const express = require('express');
const axios = require('axios');
const { addRecommendation } = require('../controllers/recommendationController');
const db = require('../db');

jest.mock('axios');
jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

const app = express();
app.use(express.json());
app.post('/recommendations/add', addRecommendation);

describe('Recommendation Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /recommendations/add', () => {
    it('should add a recommendation', async () => {
      const recommendationData = {
        movieId: 1,
        recommendedBy: 1,
        recommendedTo: 2,
      };

      const movieResponse = {
        data: {
          id: 1,
          title: 'Inception',
        },
      };

      axios.get.mockResolvedValueOnce(movieResponse);
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app).post('/recommendations/add').send(recommendationData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Recommendation added successfully' });
    });

    it('should handle errors when fetching movie details', async () => {
      const recommendationData = {
        movieId: 1,
        recommendedBy: 1,
        recommendedTo: 2,
      };

      axios.get.mockRejectedValueOnce(new Error('API error'));

      const response = await request(app).post('/recommendations/add').send(recommendationData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to add recommendation' });
    });

    it('should handle errors when inserting recommendation', async () => {
      const recommendationData = {
        movieId: 1,
        recommendedBy: 1,
        recommendedTo: 2,
      };

      const movieResponse = {
        data: {
          id: 1,
          title: 'Inception',
        },
      };

      axios.get.mockResolvedValueOnce(movieResponse);
      db.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/recommendations/add').send(recommendationData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to add recommendation' });
    });
  });
});