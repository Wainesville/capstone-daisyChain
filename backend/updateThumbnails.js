const pool = require('./db'); // Ensure the correct path to the db module
const axios = require('axios');

const updateThumbnails = async () => {
  try {
    const movies = await pool.query('SELECT * FROM movies');

    for (const movie of movies.rows) {
      if (!movie.thumbnail.startsWith('https://image.tmdb.org/t/p/w500')) {
        const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}`, {
          params: {
            api_key: '8feb4db25b7185d740785fc6b6f0e850',
          },
        });
        const movieData = movieResponse.data;
        const posterPath = `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;

        await pool.query(
          'UPDATE movies SET thumbnail = $1 WHERE id = $2',
          [posterPath, movie.id]
        );
        console.log(`Updated thumbnail for movie ID ${movie.id}`);
      }
    }

    console.log('Thumbnails updated successfully');
  } catch (err) {
    console.error('Error updating thumbnails:', err);
  } finally {
    pool.end();
  }
};

updateThumbnails();