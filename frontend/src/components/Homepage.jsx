import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Homepage.css';
import { fetchAllReviews } from '../api';

const Homepage = () => {
  const [reviews, setReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/login'; // Redirect to login page
          return;
        }

        const response = await fetchAllReviews();
        setReviews(response);

        await Promise.all(response.map(async (review) => {
          try {
            const likesResponse = await axios.get(`http://localhost:5000/api/reviews/${review.id}/likes`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const commentsResponse = await axios.get(`http://localhost:5000/api/reviews/${review.id}/comments`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (likesResponse.data.likes > 0) {
              setLikedReviews(prev => new Set(prev).add(review.id));
            }

            setComments(prev => ({
              ...prev,
              [review.id]: commentsResponse.data,
            }));
          } catch (err) {
            console.error(`Failed to fetch likes or comments for review ID: ${review.id}`, err);
          }
        }));
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };

    fetchReviews();
  }, []);

  const handleLikeToggle = async (review_id) => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    try {
      if (likedReviews.has(review_id)) {
        await axios.delete(`http://localhost:5000/api/reviews/${review_id}/like`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { user_id: userId },
        });
        setLikedReviews(prev => {
          const newLiked = new Set(prev);
          newLiked.delete(review_id);
          return newLiked;
        });
      } else {
        await axios.post(`http://localhost:5000/api/reviews/${review_id}/like`, { user_id: userId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLikedReviews(prev => new Set(prev).add(review_id));
      }

      const likesResponse = await axios.get(`http://localhost:5000/api/reviews/${review_id}/likes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === review_id ? { ...review, likes: likesResponse.data.likes } : review
        )
      );
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.error('User has already liked this review');
      } else {
        console.error('Failed to update like status', err);
      }
    }
  };

  const handleCommentSubmit = async (review_id) => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/comments/${review_id}/comments`, {
        user_id: userId,
        content: newComment[review_id] || '',
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments(prev => ({
        ...prev,
        [review_id]: [...(prev[review_id] || []), response.data],
      }));

      setNewComment(prev => ({ ...prev, [review_id]: '' }));
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  return (
    <div className="homepage">
      <h2>Latest Reviews</h2>
      <div className="reviews">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-content-wrapper">
                <div className="movie-title">{review.movie_title}</div>
                <div className="review-content">
                  <p><strong>{review.username} says:</strong></p>
                  <p>"{review.content}"</p>
                  <p><strong>Recommendation:</strong> {review.recommendation ? '👍' : '👎'}</p>
                  <p><strong>Rating:</strong> {review.rating}/10</p>
                </div>
                <div className="review-interactions">
                  <div className="comments-section">
                    <h4>Comments:</h4>
                    {comments[review.id]?.map((comment) => (
                      <div key={comment.id} className="comment">
                        <p>
                          <strong>{comment.username}</strong>: {comment.content}
                        </p>
                      </div>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCommentSubmit(review.id);
                      }}
                    >
                      <input
                        type="text"
                        value={newComment[review.id] || ''}
                        onChange={(e) =>
                          setNewComment(prev => ({ ...prev, [review.id]: e.target.value }))
                        }
                        placeholder="Write a comment..."
                      />
                      <button type="submit">Post Comment</button>
                    </form>
                  </div>
                  <div className="like-section">
                    <button onClick={() => handleLikeToggle(review.id)}>
                      {likedReviews.has(review.id) ? 'Unlike' : 'Like'}
                    </button>
                    <span>{review.likes || 0} likes</span>
                  </div>
                </div>
              </div>
              <Link to={`/movie/${review.movie_id}`}>
                <img src={review.thumbnail} alt={review.movie_title} className="movie-thumbnail" onError={(e) => console.error('Image load error:', e)} />
              </Link>
            </div>
          ))
        ) : (
          <p>No reviews found.</p>
        )}
      </div>
    </div>
  );
};

export default Homepage;