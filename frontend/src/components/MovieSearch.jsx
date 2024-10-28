import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { searchMovies } from '../api'; // Ensure the import matches your available exports
import './styles.css'; // Update the import to your consolidated CSS file

function MovieSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    const results = await searchMovies(searchTerm); // Ensure you're using the correct function
    setSearchResults(results);
  };

  return (
    <div>
      <h2>Search Movies</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a movie..."
      />
      <button onClick={handleSearch}>Search</button>
      <div className="movie-grid">
        {searchResults.map((movie) => (
          <div key={movie.id} className="movie-card">
            {/* Use Link to navigate to the MovieInfo page for the selected movie */}
            <Link to={`/movie/${movie.id}`}>
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
              <h3>{movie.title}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieSearch;
