import React, { useEffect, useState } from 'react';
import { fetchUpcomingMovies } from '../api';
import './styles.css'; // Ensure you're importing your consolidated CSS

const ITEMS_PER_PAGE = 60;

function UpcomingMovies({ openModal }) {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [allMovies, setAllMovies] = useState(new Set()); // To keep track of all unique movies

  useEffect(() => {
    const loadUpcomingMovies = async () => {
      const movies = await fetchUpcomingMovies(1); // Fetch the first page
      const uniqueMovies = movies.filter(movie => !allMovies.has(movie.id));
      setAllMovies(new Set(uniqueMovies.map(movie => movie.id)));
      setUpcomingMovies(uniqueMovies);
    };
    loadUpcomingMovies();
  }, []); // Run only once on component mount

  return (
    <div>
      <h2>Upcoming Movies</h2>
      <div className="movie-grid">
        {upcomingMovies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => openModal(movie.id)}>
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
            <h3>{movie.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingMovies;