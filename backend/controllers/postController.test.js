const { getPosts, createPost } = require('./postController');
const pool = require('../db');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

describe('postController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should return all posts', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockPosts = [{ id: 1, content: 'Post 1' }, { id: 2, content: 'Post 2' }];
      pool.query.mockResolvedValueOnce({ rows: mockPosts });

      await getPosts(req, res);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM posts ORDER BY timestamp DESC');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should handle errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await getPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const req = {
        body: {
          content: 'New post',
          recommendation: 'Yes',
          user: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockPost = { id: 1, content: 'New post', recommendation: 'Yes', user: 1 };
      pool.query.mockResolvedValueOnce({ rows: [mockPost] });

      await createPost(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO posts (content, recommendation, user) VALUES ($1, $2, $3) RETURNING *',
        ['New post', 'Yes', 1]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should handle errors', async () => {
      const req = {
        body: {
          content: 'New post',
          recommendation: 'Yes',
          user: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});