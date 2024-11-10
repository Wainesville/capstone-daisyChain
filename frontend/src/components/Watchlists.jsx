import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWatchlist, removeFromWatchlist } from '../api';
import axios from 'axios';
import './styles.css';

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/login'; // Redirect to login page
          return;
        }
        const movies = await fetchWatchlist(token);
        setWatchlist(movies);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        alert('Failed to fetch watchlist. Please try again later.');
      }
    };

    loadWatchlist();
  }, []);

  const handleRemove = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await removeFromWatchlist(movieId, token);
      setWatchlist(watchlist.filter((movie) => movie.movie_id !== movieId));
    } catch (error) {
      alert('Failed to remove movie from watchlist.');
    }
  };

  const handleSetCurrentlyWatching = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/watchlist/currently-watching/${movieId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setWatchlist(watchlist.map((movie) => ({
        ...movie,
        currently_watching: movie.movie_id === movieId,
      })));
    } catch (error) {
      alert('Failed to set currently watching.');
    }
  };

  const handleSetNextUp = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/watchlist/next-up/${movieId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setWatchlist(watchlist.map((movie) => ({
        ...movie,
        next_up: movie.movie_id === movieId,
      })));
    } catch (error) {
      alert('Failed to set next up.');
    }
  };

  return (
    <div className="watchlist">
      <h2>Your Watchlist</h2>
      <div className="movie-grid">
        {watchlist.map((movie) => (
          <div key={movie.movie_id} className="movie-card">
            <Link to={`/movie/${movie.movie_id}`}>
              <img src={`https://image.tmdb.org/t/p/w500/${movie.poster}`} alt={movie.title} />
              <h3>{movie.title}</h3>
            </Link>
            <button onClick={() => handleRemove(movie.movie_id)}>Remove</button>
            <div className="toggle-buttons">
              <button
                className={`toggle-button ${movie.currently_watching ? 'active' : ''}`}
                onClick={() => handleSetCurrentlyWatching(movie.movie_id)}
              >
                Currently Watching
              </button>
              <button
                className={`toggle-button ${movie.next_up ? 'active' : ''}`}
                onClick={() => handleSetNextUp(movie.movie_id)}
              >
                Next Up
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;