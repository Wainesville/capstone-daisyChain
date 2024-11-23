import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Watchlists.css'; // Ensure the correct CSS file is imported

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [currentlyWatching, setCurrentlyWatching] = useState(null);
  const [nextUp, setNextUp] = useState(null);

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/login'; // Redirect to login page
          return;
        }
        const response = await axios.get('http://localhost:5000/api/watchlist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWatchlist(response.data);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    loadWatchlist();
  }, []);

  const handleRemove = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/watchlist/remove/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWatchlist(watchlist.filter((movie) => movie.movie_id !== movieId));
    } catch (error) {
      console.error('Failed to remove movie from watchlist:', error);
    }
  };

  const handleSetCurrentlyWatching = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/watchlist/currently-watching/${movieId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const selectedMovie = watchlist.find((movie) => movie.movie_id === movieId);
      if (selectedMovie) {
        setWatchlist(watchlist.filter((movie) => movie.movie_id !== movieId));
        if (currentlyWatching) {
          setWatchlist((prevWatchlist) => [...prevWatchlist, currentlyWatching]);
        }
        setCurrentlyWatching(selectedMovie);
      }
    } catch (error) {
      console.error('Failed to set currently watching:', error);
    }
  };

  const handleSetNextUp = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/watchlist/next-up/${movieId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const selectedMovie = watchlist.find((movie) => movie.movie_id === movieId);
      if (selectedMovie) {
        setWatchlist(watchlist.filter((movie) => movie.movie_id !== movieId));
        if (nextUp) {
          setWatchlist((prevWatchlist) => [...prevWatchlist, nextUp]);
        }
        setNextUp(selectedMovie);
      }
    } catch (error) {
      console.error('Failed to set next up:', error);
    }
  };

  return (
    <div className="watchlist">
      <h2>Your Watchlist</h2>
      <div className="movie-grid">
        {currentlyWatching && (
          <div className="movie-card first-spot">
            <Link to={`/movie/${currentlyWatching.movie_id}`}>
              <img src={`https://image.tmdb.org/t/p/w500/${currentlyWatching.poster}`} alt={currentlyWatching.title} />
              <h3>{currentlyWatching.title}</h3>
            </Link>
            <button onClick={() => handleSetCurrentlyWatching(currentlyWatching.movie_id)}>Remove from Currently Watching</button>
          </div>
        )}
        {nextUp && (
          <div className="movie-card second-spot">
            <Link to={`/movie/${nextUp.movie_id}`}>
              <img src={`https://image.tmdb.org/t/p/w500/${nextUp.poster}`} alt={nextUp.title} />
              <h3>{nextUp.title}</h3>
            </Link>
            <button onClick={() => handleSetNextUp(nextUp.movie_id)}>Remove from Next Up</button>
          </div>
        )}
        {watchlist.map((movie) => (
          <div key={movie.movie_id} className="movie-card">
            <Link to={`/movie/${movie.movie_id}`}>
              <img src={`https://image.tmdb.org/t/p/w500/${movie.poster}`} alt={movie.title} />
              <h3>{movie.title}</h3>
            </Link>
            <button onClick={() => handleRemove(movie.movie_id)}>Remove</button>
            <div className="toggle-buttons">
              <button
                className={`toggle-button ${currentlyWatching && currentlyWatching.movie_id === movie.movie_id ? 'active' : ''}`}
                onClick={() => handleSetCurrentlyWatching(movie.movie_id)}
              >
                Currently Watching
              </button>
              <button
                className={`toggle-button ${nextUp && nextUp.movie_id === movie.movie_id ? 'active' : ''}`}
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