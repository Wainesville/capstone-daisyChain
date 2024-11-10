import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const API_KEY = '8feb4db25b7185d740785fc6b6f0e850'; // Replace with your API key
const BASE_URL = 'https://api.themoviedb.org/3';

const MovieCollage = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchRandomMovies = async () => {
      let allMovies = [];
      let totalPosters = 0;
      let page = 1;

      while (totalPosters < 30) {
        try {
          const response = await axios.get(`${BASE_URL}/trending/movie/week`, {
            params: { api_key: API_KEY, page },
          });

          // Add movies with a poster_path to the allMovies array
          allMovies = [...allMovies, ...response.data.results];

          // Filter for valid posters
          const posters = allMovies.filter(movie => movie.poster_path);
          totalPosters = posters.length; // Update totalPosters count

          // If we have 24 or more, deduplicate and slice to keep only the first 24
          if (totalPosters >= 30) {
            // Deduplicate by id
            const uniquePosters = Array.from(new Map(posters.map(movie => [movie.id, movie])).values());
            setMovies(uniquePosters.slice(0, 30)); // Set the unique posters
            return; // Exit once we have enough posters
          }

          // Increment the page number for the next API call
          page += 1;
        } catch (error) {
          console.error('Error fetching movies:', error);
          break; // Exit loop on error
        }
      }
    };

    fetchRandomMovies();
  }, []);

  return (
    <div className="movie-collage">
      {movies.map((movie) => (
        <img
          key={movie.id} // Make sure each key is unique
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="collage-image"
        />
      ))}
    </div>
  );
};

export default MovieCollage;