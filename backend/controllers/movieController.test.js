const { getAllMovies, getMovieById } = require('./movieController');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

describe('movieController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMovies', () => {
    it('should return all movies', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockMovies = [
        { id: 1, title: 'Inception', genre: 'Sci-Fi', release_date: '2010-07-16' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockMovies });

      await getAllMovies(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM movies');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getAllMovies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch movies' });
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by ID', async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockMovie = { id: 1, title: 'Inception', genre: 'Sci-Fi', release_date: '2010-07-16' };
      db.query.mockResolvedValueOnce({ rows: [mockMovie] });

      await getMovieById(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM movies WHERE id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMovie);
    });

    it('should return 404 if movie not found', async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockResolvedValueOnce({ rows: [] });

      await getMovieById(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM movies WHERE id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Movie not found' });
    });

    it('should handle errors', async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getMovieById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch movie' });
    });
  });
});