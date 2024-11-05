import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MovieDetail.css';

const MovieDetail = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [comment, setComment] = useState('');
    const [recommendation, setRecommendation] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviews, setReviews] = useState([]);
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const fetchMovieAndReviews = async () => {
            const storedMovie = JSON.parse(localStorage.getItem('reviewMovie'));
            if (storedMovie) setMovie(storedMovie);

            try {
                const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/${storedMovie.id}`);
                setReviews(reviewsResponse.data);
            } catch (err) {
                console.error('Failed to fetch reviews', err);
            }
        };
        fetchMovieAndReviews();
    }, [movieId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!movie) {
            console.error('No movie data available');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/reviews', {
                user_id: localStorage.getItem('user_id'),
                movie_id: movieId,
                content: comment,
                recommendation,  // Save thumbs-up or thumbs-down
                rating,
                movie_title: movie.title,
                thumbnail: movie.thumbnail,
                logo: movie.logo,
            });

            setReviews([...reviews, response.data]);
            setComment('');
            setRecommendation(null);
            setRating(5);
            navigate('/'); // Redirect to homepage after submitting
        } catch (err) {
            console.error('Failed to submit comment', err);
        }
    };

    return (
        <div className="movie-detail">
            <h2>Movie Reviews</h2>
            {movie && (
                <div className="movie-info">
                    <img src={movie.thumbnail} alt={`${movie.title} thumbnail`} />
                    <h3>{movie.title}</h3>
                    {movie.logo && <img src={movie.logo} alt={`${movie.title} logo`} className="movie-logo" />}
                </div>
            )}

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

export default MovieDetail;