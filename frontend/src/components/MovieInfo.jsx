import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchMovieInfo,
    addToWatchlist,
    removeFromWatchlist,
    fetchMovieVideos,
    fetchWatchlist,
    fetchMovieImages,
    fetchMovieReviews,
} from '../api';
import './MOvieInfo.css';
import axios from 'axios'; // Ensure axios is imported
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MovieInfo() {
    const { id } = useParams();
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
            try {
                const movieData = await fetchMovieInfo(id);
                setMovie(movieData);

                const images = await fetchMovieImages(id);
                const backdrops = images.backdrops;
                if (backdrops.length > 0) {
                    setBackdropImage(backdrops[0].file_path);
                }

                const videos = await fetchMovieVideos(id);
                const trailer = videos.find((video) => video.type === 'Trailer');
                if (trailer) {
                    setTrailerKey(trailer.key);
                }

                const watchlist = await fetchWatchlist();
                const isInWatchlist = watchlist.some((movie) => movie.movie_id === id);
                setInWatchlist(isInWatchlist);

                const reviewsData = await fetchMovieReviews(id);
                setReviews(reviewsData);
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
                await axios.delete(`http://localhost:5000/api/watchlist/remove/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setInWatchlist(false);
                toast.success('Movie removed from watchlist!');
            } else {
                await axios.post('http://localhost:5000/api/watchlist/add', {
                    movieId: movie.id,
                    title: movie.title,
                    poster: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setInWatchlist(true);
                toast.success('Movie added to watchlist!');
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
            const response = await axios.post('http://localhost:5000/api/reviews', {
                user_id: localStorage.getItem('user_id'),
                movie_id: id,
                content: comment,
                recommendation,
                rating,
                movie_title: movie.title,
                thumbnail: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                logo: movie.logo,
            });

            setReviews([...reviews, response.data]);
            setComment('');
            setRecommendation(null);
            setRating(5);
            navigate('/'); // Redirect to homepage after submitting
        } catch (err) {
            console.error('Failed to submit comment', err.response ? err.response.data : err.message);
        }
    };

    if (error) return <div>{error}</div>;
    if (!movie) return <div>Loading...</div>;

    const director = movie.credits?.crew.find((member) => member.job === 'Director');
    const topActors = movie.credits?.cast.slice(0, 5) || [];
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

            <div className="movie-details">
                <p className="overview">{movie.overview}</p>
                <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
                <p><strong>Rating:</strong> {movie.vote_average}/10</p>
                <p><strong>Age Guide:</strong> {ageGuide}</p>
                <p><strong>Release Date:</strong> {movie.release_date}</p>
                <button onClick={handleWatchlistToggle} className="add-to-watchlist-button">
                    {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                <button onClick={handleReviewMovie} className="review-movie-button">
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
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
}

export default MovieInfo;