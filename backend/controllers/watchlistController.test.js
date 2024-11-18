const { getWatchlist, addToWatchlist, getWatchlistByUserId, removeFromWatchlist, setCurrentlyWatching, setNextUp } = require('./watchlistController');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

describe('watchlistController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWatchlist', () => {
    it('should return the watchlist for the logged-in user', async () => {
      const req = { user: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockWatchlist = [
        { user_id: 1, movie_id: 1, title: 'Inception', poster: 'poster.jpg' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockWatchlist });

      await getWatchlist(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM watchlist WHERE user_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWatchlist);
    });

    it('should handle errors', async () => {
      const req = { user: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getWatchlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch watchlist' });
    });
  });

  describe('addToWatchlist', () => {
    it('should add a movie to the watchlist', async () => {
      const req = {
        user: { userId: 1 },
        body: {
          movieId: 1,
          title: 'Inception',
          poster: 'poster.jpg',
          logo: 'logo.jpg',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockResolvedValueOnce({ rows: [] }); // Movie does not exist
      db.query.mockResolvedValueOnce({ rows: [] }); // Insert movie
      db.query.mockResolvedValueOnce({ rows: [] }); // Add to watchlist

      await addToWatchlist(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM movies WHERE id = $1', [1]);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO movies (id, title, thumbnail, logo) VALUES ($1, $2, $3, $4)',
        [1, 'Inception', 'poster.jpg', 'logo.jpg']
      );
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO watchlist (user_id, movie_id, title, poster) VALUES ($1, $2, $3, $4)',
        [1, 1, 'Inception', 'poster.jpg']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Movie added to watchlist' });
    });

    it('should handle errors', async () => {
      const req = {
        user: { userId: 1 },
        body: {
          movieId: 1,
          title: 'Inception',
          poster: 'poster.jpg',
          logo: 'logo.jpg',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await addToWatchlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add movie to watchlist' });
    });
  });

  describe('getWatchlistByUserId', () => {
    it('should return the watchlist for a specific user', async () => {
      const req = { params: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockWatchlist = [
        { user_id: 1, movie_id: 1, title: 'Inception', poster: 'poster.jpg' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockWatchlist });

      await getWatchlistByUserId(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM watchlist WHERE user_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWatchlist);
    });

    it('should handle errors', async () => {
      const req = { params: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getWatchlistByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch watchlist' });
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove a movie from the watchlist', async () => {
      const req = { user: { userId: 1 }, params: { movieId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await removeFromWatchlist(req, res);

      expect(db.query).toHaveBeenCalledWith('DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2', [1, 1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Movie removed from watchlist' });
    });

    it('should handle errors', async () => {
      const req = { user: { userId: 1 }, params: { movieId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await removeFromWatchlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to remove movie from watchlist' });
    });
  });

  describe('setCurrentlyWatching', () => {
    it('should set a movie as currently watching', async () => {
      const req = { user: { userId: 1 }, params: { movieId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setCurrentlyWatching(req, res);

      expect(db.query).toHaveBeenCalledWith('UPDATE watchlist SET currently_watching = false WHERE user_id = $1', [1]);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE watchlist SET currently_watching = true, "order" = 1 WHERE user_id = $1 AND movie_id = $2',
        [1, 1]
      );
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE watchlist SET "order" = "order" + 1 WHERE user_id = $1 AND movie_id != $2',
        [1, 1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Currently watching updated' });
    });

    it('should handle errors', async () => {
      const req = { user: { userId: 1 }, params: { movieId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await setCurrentlyWatching(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to set currently watching' });
    });
  });

  describe('setNextUp', () => {
    it('should set a movie as next up', async () => {
      const req = { user: { userId: 1 }, params: { movieId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setNextUp(req, res);

      expect(db.query).toHaveBeenCalledWith('UPDATE watchlist SET next_up = false WHERE user_id = $1', [1]);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE watchlist SET next_up = true, "order" = 2 WHERE user_id = $1 AND movie_id = $2',
        [1, 1]
      );
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE watchlist SET "order" = "order" + 1 WHERE user_id = $1 AND movie_id != $2 AND "order" >= 2',
        [1, 1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Next up updated' });
    });

    it('should handle errors', async () => {
      const req = { user: { userId: 1 }, params: { movieId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await setNextUp(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to set next up' });
    });
  });
});