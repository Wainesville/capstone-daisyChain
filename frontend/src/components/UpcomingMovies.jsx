import React, { useEffect, useState } from 'react';
import { fetchUpcomingMovies } from '../api';
import { useNavigate } from 'react-router-dom';
import './styles.css'; // Ensure you're importing your consolidated CSS

const ITEMS_PER_PAGE = 24;

function UpcomingMovies() {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUpcomingMovies = async () => {
      const movies = await fetchUpcomingMovies(currentPage); // Pass the current page
      setUpcomingMovies(movies);
    };
    loadUpcomingMovies();
  }, [currentPage]); // Depend on currentPage to load new movies when page changes

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1)); // Prevent going below 1
  };

  return (
    <div>
      <h2>Upcoming Movies</h2>
      <div className="movie-grid">
        {upcomingMovies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
            <h3>{movie.title}</h3>
          </div>
        ))}
      </div>
      <div className="pagination">
        {currentPage > 1 && ( // Show Previous button only if not on the first page
          <button onClick={handlePrevPage}>Previous</button>
        )}
        <span>Page {currentPage}</span>
        {upcomingMovies.length === ITEMS_PER_PAGE && ( // Show Next button only if there are more movies to load
          <button onClick={handleNextPage}>Next</button>
        )}
      </div>
    </div>
  );
}

export default UpcomingMovies;
