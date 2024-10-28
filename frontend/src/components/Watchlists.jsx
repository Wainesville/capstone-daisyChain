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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;
