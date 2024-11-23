import React, { useEffect, useState } from 'react';
import { fetchGenres, fetchMoviesByGenre, searchMovies } from '../api';
import './styles.css'; // Ensure you're importing your consolidated CSS

const ITEMS_PER_PAGE = 60;

function Browse({ openModal }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genreMovies, setGenreMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allMovies, setAllMovies] = useState(new Set()); // To keep track of all unique movies

  useEffect(() => {
    const loadGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };
    loadGenres();
  }, []);

  const handleGenreClick = async (genreId) => {
    setSelectedGenre(genreId);
    setSearchResults([]); // Clear search results when a genre is selected
    setSearchTerm(''); // Clear search term when a genre is selected
    setAllMovies(new Set()); // Reset the set of all movies
    await loadMoviesByGenre(genreId); // Load movies for the selected genre
  };

  const loadMoviesByGenre = async (genreId) => {
    const results = await fetchMoviesByGenre(genreId, 1); // Fetch the first page
    const uniqueMovies = results.filter(movie => !allMovies.has(movie.id));
    setAllMovies(new Set(uniqueMovies.map(movie => movie.id)));
    setGenreMovies(uniqueMovies);
  };

  const handleSearch = async () => {
    const results = await searchMovies(searchTerm); // Ensure you're using the correct function
    setSearchResults(results);
    setSelectedGenre(''); // Clear selected genre when searching
  };

  return (
    <div className="browse-page">
      <h2>Select a Genre</h2>
      <div className="browse-container">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className="genre-button"
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div>
        <h2>Search Movies</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a movie..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {searchResults.length > 0 && (
        <div>
          <h2>Search Results</h2>
          <div className="movie-grid">
            {searchResults.map((movie) => (
              <div key={movie.id} className="movie-card">
                <button onClick={() => openModal(movie.id)}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                </button>
                <h3>{movie.title}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedGenre && genreMovies.length > 0 && (
        <div>
          <h2>Movies in {genres.find((g) => g.id === parseInt(selectedGenre))?.name}</h2>
          <div className="movie-grid">
            {genreMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <button onClick={() => openModal(movie.id)}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                </button>
                <h3>{movie.title}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Browse;