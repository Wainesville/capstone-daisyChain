const { getAllReviews, createReview } = require('./reviewController');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

describe('reviewController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllReviews', () => {
    it('should return all reviews', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockReviews = [
        { id: 1, user_id: 1, movie_id: 1, content: 'Great movie!', recommendation: 'Yes', rating: 5, created_at: '2023-01-01' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockReviews });

      await getAllReviews(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM reviews');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it('should handle errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getAllReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch reviews' });
    });
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const req = {
        body: {
          user_id: 1,
          movie_id: 1,
          content: 'Great movie!',
          recommendation: 'Yes',
          rating: 5,
          movie_title: 'Inception',
          thumbnail: 'thumbnail.jpg',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
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

      await createReview(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO reviews (user_id, movie_id, content, recommendation, rating, movie_title, thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [1, 1, 'Great movie!', 'Yes', 5, 'Inception', 'thumbnail.jpg']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it('should handle errors', async () => {
      const req = {
        body: {
          user_id: 1,
          movie_id: 1,
          content: 'Great movie!',
          recommendation: 'Yes',
          rating: 5,
          movie_title: 'Inception',
          thumbnail: 'thumbnail.jpg',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create review' });
    });
  });
});