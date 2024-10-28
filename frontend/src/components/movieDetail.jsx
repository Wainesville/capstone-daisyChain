import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

const MovieDetail = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();  // Initialize useNavigate
    const [comment, setComment] = useState('');
    const [recommendation, setRecommendation] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const storedMovie = JSON.parse(localStorage.getItem('reviewMovie'));
        if (storedMovie) {
            setMovie(storedMovie);
        }

        const fetchReviews = async () => {
            if (!storedMovie) return;

            try {
                const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/${storedMovie.id}`);
                setReviews(reviewsResponse.data);
            } catch (err) {
                console.error('Failed to fetch reviews', err);
            }
        };

        fetchReviews();
    }, [movieId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!movie) {
            console.error('No movie data available');
            return; // Prevent submission if movie is not set
        }

        try {
            const response = await axios.post('http://localhost:5000/api/reviews', {
                user_id: localStorage.getItem('user_id'),
                movie_id: movieId,
                content: comment,
                recommendation: recommendation,
                movie_title: movie.title,          // Include movie title
                thumbnail: movie.thumbnail          // Include movie thumbnail
            });
            setReviews([...reviews, response.data]);
            setComment('');

            // Navigate to the homepage after submitting the review
            navigate('/');  // Redirect to the homepage
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
                </div>
            )}
            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a comment/review"
                    required
                />
                <label>
                    Recommend this movie?
                    <input
                        type="checkbox"
                        checked={recommendation}
                        onChange={(e) => setRecommendation(e.target.checked)}
                    />
                </label>
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
                        <p>Recommendation: {review.recommendation ? 'Yes' : 'No'}</p>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieDetail;
