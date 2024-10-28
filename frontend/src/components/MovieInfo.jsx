import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchMovieInfo,
    addToWatchlist,
    removeFromWatchlist,
    fetchMovieVideos,
    fetchWatchlist,
    fetchMovieImages,
} from '../api';
import './MOvieInfo.css';

function MovieInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [trailerKey, setTrailerKey] = useState('');
    const [inWatchlist, setInWatchlist] = useState(false);
    const [error, setError] = useState(null);
    const [backdropImage, setBackdropImage] = useState('');

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
            } catch (err) {
                setError('Failed to load movie information.');
            }
        };
        loadMovieInfo();
    }, [id]);

    const handleWatchlistToggle = async () => {
        try {
            if (inWatchlist) {
                await removeFromWatchlist(id);
                setInWatchlist(false);
                alert('Movie removed from watchlist!');
            } else {
                await addToWatchlist(movie.id, movie.title, movie.poster_path);
                setInWatchlist(true);
                alert('Movie added to watchlist!');
            }
        } catch (error) {
            alert('You must be logged in to modify your watchlist.');
        }
    };

    const handleReviewMovie = () => {
        if (!movie) return; // Ensure movie details are available
        localStorage.setItem('reviewMovie', JSON.stringify({
            id: movie.id,
            title: movie.title,
            thumbnail: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
        }));
        navigate(`/movie-detail/${movie.id}`);
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
                    Review Movie
                </button>
            </div>

            <div className="director-actors">
                <h4 className="director">Director: {director ? director.name : 'N/A'}</h4>
                <h4 className="actors-title">Top 5 Actors:</h4>
                <ul className="actors-list">
                    {topActors.map((actor) => (
                        <li key={actor.id} className="actor-name">{actor.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MovieInfo;
