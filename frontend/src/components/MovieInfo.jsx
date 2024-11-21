import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MOvieInfo.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createReview, addToWatchlist, removeFromWatchlist } from '../api'; // Import the createReview, addToWatchlist, and removeFromWatchlist functions

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '8feb4db25b7185d740785fc6b6f0e850';

const MovieInfo = ({ id: propId, onClose }) => {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [error, setError] = useState(null);
  const [backdropImage, setBackdropImage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [comment, setComment] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const loadMovieInfo = async () => {
      if (!id) {
        setError('Invalid movie ID');
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/movie/${id}`, {
          params: {
            api_key: API_KEY,
            append_to_response: 'credits,videos,images', // Fetch credits, videos, and images in one request
          },
        });
        setMovie(response.data);

        const backdrops = response.data.images?.backdrops || [];
        if (backdrops.length > 0) {
          setBackdropImage(backdrops[0].file_path);
        }

        const trailer = response.data.videos?.results?.find(video => video.type === 'Trailer');
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        const token = localStorage.getItem('token');
        if (token) {
          const watchlistResponse = await axios.get(`http://localhost:5000/api/watchlist`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const isInWatchlist = watchlistResponse.data.some((movie) => movie.movie_id === id);
          setInWatchlist(isInWatchlist);

          const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/movie/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setReviews(reviewsResponse.data);
        }
      } catch (err) {
        console.error('Failed to load movie information:', err.response ? err.response.data : err.message);
        setError('Failed to load movie information.');
      }
    };
    loadMovieInfo();
  }, [id]);

  const handleWatchlistToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to modify your watchlist.');
        return;
      }

      if (inWatchlist) {
        const success = await removeFromWatchlist(id);
        if (success) {
          setInWatchlist(false);
          toast.success('Movie removed from watchlist!');
        } else {
          toast.error('Failed to remove movie from watchlist.');
        }
      } else {
        const success = await addToWatchlist(movie.id, movie.title, `https://image.tmdb.org/t/p/w500/${movie.poster_path}`);
        if (success) {
          setInWatchlist(true);
          toast.success('Movie added to watchlist!');
        } else {
          toast.error('Failed to add movie to watchlist.');
        }
      }
    } catch (error) {
      console.error('Failed to modify watchlist:', error);
      toast.error('Failed to modify watchlist.');
    }
  };

  const handleReviewMovie = () => {
    setShowReviewForm(!showReviewForm);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!movie) {
      console.error('No movie data available');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      if (!token || !userId) {
        toast.error('You must be logged in to submit a review.');
        return;
      }

      const reviewData = {
        user_id: userId,
        movie_id: id,
        content: comment,
        recommendation,
        rating,
        movie_title: movie.title,
        thumbnail: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      };

      console.log('Submitting review with data:', reviewData);

      const response = await createReview(reviewData);

      if (response) {
        console.log('Review submitted successfully:', response);
        setReviews([...reviews, response]);
        setComment('');
        setRecommendation(null);
        setRating(5);

        // Redirect to the reviews page
        navigate('/homepage');
      } else {
        console.error('Failed to submit review');
      }
    } catch (err) {
      console.error('Failed to submit comment', err.response ? err.response.data : err.message);
    }
  };

  const handleAddRecommendation = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;

      if (!token || !userId) {
        toast.error('You must be logged in to add a recommendation.');
        return;
      }

      const recommendationData = {
        movieId: movie.id,
        userId: userId,
        title: movie.title,
        content: 'Recommended movie', // Replace with actual content if needed
      };

      console.log('Sending recommendation data:', recommendationData);

      await axios.post('http://localhost:5000/api/recommendations/add', recommendationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Movie added to recommendations!');
    } catch (error) {
      console.error('Failed to add recommendation:', error.response ? error.response.data : error.message);
      toast.error('Failed to add recommendation.');
    }
  };

  if (error) return <div>{error}</div>;
  if (!movie) return <div>Loading...</div>;

  const director = movie.credits?.crew.find((member) => member.job === 'Director');
  const actors = movie.credits?.cast.slice(0, 5) || [];
  const ageGuide = movie.adult ? '18+' : 'PG-13';

  return (
    <div
      className="movie-info-container"
      style={{
        backgroundImage: backdropImage ? `url(https://image.tmdb.org/t/p/w500/${backdropImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '20px',
      }}
    >
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }} // Ensure the ToastContainer is on top
      />
      <button onClick={onClose} className="close-button">Close</button>
      <div className="movie-header">
        <h1 className="movie-title">{movie.title}</h1>
        <img
          className="movie-poster"
          src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
          alt={movie.title}
        />
      </div>

      {trailerKey && (
        <div className="trailer-container">
          <h3 className="trailer-title">Watch Trailer</h3>
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="movie-details-container">
        <div className="movie-details">
          <div className="overview-container">
            <p className="overview">{movie.overview}</p>
          </div>
          <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
          <p><strong>Rating:</strong> {movie.vote_average}/10</p>
          <p><strong>Age Guide:</strong> {ageGuide}</p>
          <p><strong>Release Date:</strong> {movie.release_date}</p>
          <p><strong>Actors:</strong> {actors.map(actor => actor.name).join(', ')}</p>
          <p><strong>Director:</strong> {director?.name}</p>
          <button onClick={handleWatchlistToggle} className="add-to-watchlist-button">
            {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
          <button onClick={handleAddRecommendation} className="add-to-recommendations-button">
            Add to Recommendations
          </button>
          <button onClick={handleReviewMovie} className="review-movie-button">
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>
      </div>

      {showReviewForm && (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment/review"
            required
          />
          <div className="recommendation-buttons">
            <button
              type="button"
              onClick={() => setRecommendation(true)}
              className={`thumb-button ${recommendation === true ? 'active' : ''}`}
            >
              👍
            </button>
            <button
              type="button"
              onClick={() => setRecommendation(false)}
              className={`thumb-button ${recommendation === false ? 'active' : ''}`}
            >
              👎
            </button>
          </div>
          <div className="rating-slider">
            <label htmlFor="rating">Rating: {rating}</label>
            <input
              type="range"
              id="rating"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <button type="submit">Post Review</button>
        </form>
      )}

      <div className="reviews">
        <h3>Reviews:</h3>
        {reviews.map((review) => (
          <div key={review.id} className="review">
            <div className="review-header">
              <img src={review.thumbnail} alt={`${review.movie_title} thumbnail`} className="review-thumbnail" />
              <p><strong>{review.username}</strong> says:</p>
            </div>
            <p>{review.content}</p>
            <p>Recommendation: {review.recommendation ? '👍' : '👎'}</p>
            <p>Rating: {review.rating}/10</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieInfo;