import React, { useEffect, useState } from 'react';
import { fetchTrendingMovies } from '../api';
import { useNavigate } from 'react-router-dom';
import './styles.css'; // Ensure you're importing your consolidated CSS

const ITEMS_PER_PAGE = 24;

function TrendingMovies() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTrendingMovies = async () => {
      const movies = await fetchTrendingMovies(currentPage); // Pass the current page
      setTrendingMovies(movies);
    };
    loadTrendingMovies();
  }, [currentPage]); // Depend on currentPage to load new movies when page changes

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1)); // Prevent going below 1
  };

  return (
    <div>
      <h2>Trending Movies</h2>
      <div className="movie-grid">
        {trendingMovies.map((movie) => (
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
        {trendingMovies.length === ITEMS_PER_PAGE && ( // Show Next button only if there are more movies to load
          <button onClick={handleNextPage}>Next</button>
        )}
      </div>
    </div>
  );
}

export default TrendingMovies;
