const { createComment, getCommentsByReviewId } = require('./commentsController');
const db = require('../db');

jest.mock('../db', () => {
  return {
    query: jest.fn(),
  };
});

describe('commentsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const req = {
        params: { review_id: 1 },
        body: {
          user_id: 1,
          content: 'Great review!',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockComment = {
        id: 1,
        user_id: 1,
        review_id: 1,
        content: 'Great review!',
        created_at: '2023-01-01',
      };
      db.query.mockResolvedValueOnce({ rows: [mockComment] });

      await createComment(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO comments (user_id, review_id, content) VALUES ($1, $2, $3) RETURNING *',
        [1, 1, 'Great review!']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockComment);
    });

    it('should handle errors', async () => {
      const req = {
        params: { review_id: 1 },
        body: {
          user_id: 1,
          content: 'Great review!',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to post comment' });
    });
  });

  describe('getCommentsByReviewId', () => {
    it('should return comments for a specific review', async () => {
      const req = { params: { review_id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockComments = [
        { id: 1, user_id: 1, username: 'user1', content: 'Great review!', created_at: '2023-01-01' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockComments });

      await getCommentsByReviewId(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT c.id, c.user_id, u.username, c.content, c.created_at FROM comments c JOIN users u ON c.user_id = u.id WHERE c.review_id = $1 ORDER BY c.created_at ASC',
        [1]
      );
      expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    it('should handle errors', async () => {
      const req = { params: { review_id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await getCommentsByReviewId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch comments' });
    });
  });
});