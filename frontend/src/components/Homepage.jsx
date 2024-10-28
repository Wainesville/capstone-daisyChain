import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Homepage.css'; // Import your CSS file

const Homepage = () => {
  const [reviews, setReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState(new Set()); // To track liked reviews
  const [newComment, setNewComment] = useState({}); // Track new comments for each review
  const [comments, setComments] = useState({}); // To store comments for each review

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reviews');
        console.log('Fetched reviews:', response.data);
        setReviews(response.data);
        
        // Fetch likes and comments for each review after confirming reviews are fetched
        await Promise.all(response.data.map(async (review) => {
          console.log(`Fetching likes and comments for review ID: ${review.id}`); // Log the review ID
          try {
            const likesResponse = await axios.get(`http://localhost:5000/api/reviews/${review.id}/likes`);
            console.log(`Fetched likes for review ID ${review.id}:`, likesResponse.data); // Log likes data
            const commentsResponse = await axios.get(`http://localhost:5000/api/comments/${review.id}/comments`);
            
            if (likesResponse.data.likes > 0) {
              setLikedReviews((prev) => new Set(prev).add(review.id));
            }
    
            // Set comments for the review
            setComments((prev) => ({
              ...prev,
              [review.id]: commentsResponse.data,  // Map review.id to its comments
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
    const userId = localStorage.getItem('user_id'); // Ensure user_id is stored in localStorage
    
    try {
      if (likedReviews.has(review_id)) {
        // Unlike the review
        await axios.delete(`http://localhost:5000/api/reviews/${review_id}/like`, { data: { user_id: userId } });
        setLikedReviews((prev) => {
          const newLiked = new Set(prev);
          newLiked.delete(review_id);
          return newLiked;
        });
      } else {
        // Like the review
        const response = await axios.post(`http://localhost:5000/api/reviews/${review_id}/like`, { user_id: userId });
        setLikedReviews((prev) => new Set(prev).add(review_id));
      }

      // Fetch the updated likes count after the change
      const likesResponse = await axios.get(`http://localhost:5000/api/reviews/${review_id}/likes`);
      setReviews((prevReviews) => prevReviews.map(review => 
        review.id === review_id ? { ...review, likes: likesResponse.data.likes } : review
      ));
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.error('User has already liked this review');
      } else {
        console.error('Failed to update like status', err);
      }
    }
  };

  const handleCommentSubmit = async (review_id) => {
    console.log('Submitting comment for review ID:', review_id, 'Content:', newComment[review_id]);
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('User ID not found');
      return; // Optionally show an error message
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/comments/${review_id}/comments`, {
        user_id: userId,
        content: newComment[review_id] || '' 
      });

      // Update the comments list for this review
      setComments((prev) => ({
        ...prev,
        [review_id]: [...(prev[review_id] || []), response.data]
      }));

      // Reset the comment for this review
      setNewComment((prev) => ({ ...prev, [review_id]: '' }));
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
            <div key={review.id} className="review-box">
              <div className="review-content">
                <div className="movie-poster">
                  <Link to={`/movie/${review.movie_id}`}>
                    <img src={review.thumbnail} alt={review.movie_title} className="movie-thumbnail" />
                  </Link>
                </div>
                <div className="review-text">
                  <div className="review-header">
                    <span className="username">{review.username}</span>
                    <span className="timestamp">{new Date(review.created_at).toLocaleString()}</span>
                  </div>
                  <blockquote className="review-quote">"{review.content}"</blockquote>
                  <div className="review-footer">
                    <button onClick={() => handleLikeToggle(review.id)}>
                      {likedReviews.has(review.id) ? 'Unlike' : 'Like'}
                    </button>
                    <span>{review.likes || 0} likes</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h4>Comments:</h4>
                {comments[review.id]?.map((comment) => (
                  <div key={comment.id} className="comment">
                    <p><strong>{comment.username}</strong>: {comment.content}</p>
                  </div>
                ))}
                <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(review.id); }}>
                  <input
                    type="text"
                    value={newComment[review.id] || ''}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, [review.id]: e.target.value }))}
                    placeholder="Write a comment..."
                  />
                  <button type="submit">Post Comment</button>
                </form>
              </div>
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
