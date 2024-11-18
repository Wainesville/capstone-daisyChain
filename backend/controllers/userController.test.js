const { getUserByUsername, getNewestUsers, searchUsers, getUserProfile, updateUserProfile } = require('./userController');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByUsername', () => {
    it('should return user data by username', async () => {
      const req = { params: { username: 'testuser' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = { id: 1, username: 'testuser', email: 'testuser@example.com' };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      await getUserByUsername(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['testuser']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      const req = { params: { username: 'testuser' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockResolvedValueOnce({ rows: [] });

      await getUserByUsername(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['testuser']);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors', async () => {
      const req = { params: { username: 'testuser' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getUserByUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch user data' });
    });
  });

  describe('getNewestUsers', () => {
    it('should return the newest users', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUsers = [
        { id: 1, username: 'user1', created_at: '2023-01-01' },
        { id: 2, username: 'user2', created_at: '2023-01-02' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockUsers });

      await getNewestUsers(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getNewestUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch newest users' });
    });
  });

  describe('searchUsers', () => {
    it('should return users matching the search query', async () => {
      const req = { query: { query: 'test' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUsers = [
        { id: 1, username: 'testuser1' },
        { id: 2, username: 'testuser2' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockUsers });

      await searchUsers(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username ILIKE $1', ['%test%']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors', async () => {
      const req = { query: { query: 'test' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to search users' });
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const req = { params: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockProfile = { user_id: 1, bio: 'Test bio', profile_picture: 'path/to/pic' };
      db.query.mockResolvedValueOnce({ rows: [mockProfile] });

      await getUserProfile(req, res);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM user_profiles WHERE user_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });

    it('should handle errors', async () => {
      const req = { params: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch user profile' });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const req = {
        params: { userId: 1 },
        body: {
          profilePicture: 'path/to/new/pic',
          bio: 'New bio',
          favorite_genres: '["Action", "Comedy"]',
          top_movies: '[1, 2]',
          recommendations: '[3, 4]',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
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

      await updateUserProfile(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE user_profiles SET profile_picture = $1, bio = $2, favorite_genres = $3, top_movies = $4, recommendations = $5 WHERE user_id = $6 RETURNING *',
        ['path/to/new/pic', 'New bio', '["Action", "Comedy"]', '[1, 2]', '[3, 4]', 1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
    });

    it('should handle errors', async () => {
      const req = {
        params: { userId: 1 },
        body: {
          profilePicture: 'path/to/new/pic',
          bio: 'New bio',
          favorite_genres: '["Action", "Comedy"]',
          top_movies: '[1, 2]',
          recommendations: '[3, 4]',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update user profile' });
    });
  });
});