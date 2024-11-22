import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MOvieInfo.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addToWatchlist, removeFromWatchlist } from '../api'; // Import the addToWatchlist and removeFromWatchlist functions

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '8feb4db25b7185d740785fc6b6f0e850';

const MovieInfo = ({ id: propId, onClose }) => {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [error, setError] = useState(null);
  const [backdropImage, setBackdropImage] = useState('');

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
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;