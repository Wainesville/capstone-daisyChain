import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserPage.css';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '8feb4db25b7185d740785fc6b6f0e850';

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentlyWatching, setCurrentlyWatching] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [upNext, setUpNext] = useState(null);
  const [error, setError] = useState(null);

  const defaultProfilePicture = 'https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_1280.png'; // Default image URL

  useEffect(() => {
    console.log('UserPage received username:', username);

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/login'; // Redirect to login page
          return;
        }
        const userResponse = await axios.get(`http://localhost:5000/api/users/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched user data:', userResponse.data);
        setUser(userResponse.data);

        const watchlistResponse = await axios.get(`http://localhost:5000/api/watchlist/${userResponse.data.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWatchlist(watchlistResponse.data);

        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/user/${userResponse.data.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(reviewsResponse.data);

        // Fetch recommendations details
        if (userResponse.data.recommendations && userResponse.data.recommendations.length > 0) {
          const recommendationsDetails = await Promise.all(
            userResponse.data.recommendations.map(async (movieId) => {
              try {
                const movieResponse = await axios.get(`${BASE_URL}/movie/${movieId}`, {
                  params: {
                    api_key: API_KEY,
                  },
                });
                console.log('Fetched movie data:', movieResponse.data);
                return {
                  ...movieResponse.data,
                  thumbnail: `https://image.tmdb.org/t/p/w500/${movieResponse.data.poster_path}`,
                };
              } catch (error) {
                console.error(`Failed to fetch movie with ID ${movieId}:`, error);
                return null;
              }
            })
          );
          setRecommendations(recommendationsDetails.filter(movie => movie !== null));
        }

        // Set currently watching and up next
        if (watchlistResponse.data.length > 0) {
          setCurrentlyWatching(watchlistResponse.data[0]);
          setUpNext(watchlistResponse.data[1] || null);
        }

        // Fetch top 5 movies details
        if (userResponse.data.top_movies && userResponse.data.top_movies.length > 0) {
          const topMoviesDetails = await Promise.all(
            userResponse.data.top_movies.map(async (movieId) => {
              try {
                const movieResponse = await axios.get(`${BASE_URL}/movie/${movieId}`, {
                  params: {
                    api_key: API_KEY,
                  },
                });
                console.log('Fetched movie data:', movieResponse.data);
                return {
                  ...movieResponse.data,
                  thumbnail: `https://image.tmdb.org/t/p/w500/${movieResponse.data.poster_path}`,
                };
              } catch (error) {
                console.error(`Failed to fetch movie with ID ${movieId}:`, error);
                return null;
              }
            })
          );
          setTopMovies(topMoviesDetails.filter(movie => movie !== null));
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('User not found');
      }
    };

    fetchUserData();
  }, [username]);

  const handleRemoveRecommendation = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      await axios.post('http://localhost:5000/api/recommendations/remove', {
        movieId,
        userId: user.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the recommendations state
      setRecommendations(recommendations.filter(movie => movie.id !== movieId));
      console.log('Recommendation removed successfully');
    } catch (error) {
      console.error('Failed to remove recommendation:', error);
    }
  };

  const handleMovieClick = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      let movieResponse;
      try {
        // Check if the movie exists in the database
        movieResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Fetch movie details from external API if not found in the database
          const externalMovieResponse = await axios.get(`${BASE_URL}/movie/${movieId}`, {
            params: {
              api_key: API_KEY,
            },
          });

          const movie = externalMovieResponse.data;

          // Add the movie to the database
          try {
            await axios.post('http://localhost:5000/api/movies', {
              id: movie.id,
              title: movie.title,
              thumbnail: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            console.log('Movie added to the database:', movie);
          } catch (postError) {
            console.error('Failed to add movie to the database:', postError);
          }
        } else {
          throw error;
        }
      }

      // Navigate to the MovieInfo page
      navigate(`/movie/${movieId}`);
    } catch (error) {
      console.error('Failed to handle movie click:', error);
    }
  };

  if (error) return <div>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-page">
      <div className="user-header">
        <img src={user.profile_picture || defaultProfilePicture} alt={`${user.username}'s profile`} className="user-image" />
        <div className="user-info">
          <h1>{user.username}</h1>
          <p className="user-bio">{user.bio}</p>
        </div>
      </div>
      <div className="user-content">
        <div className="top-movies">
          <h2>Top 5 Movies</h2>
          <div className="movie-row">
            {topMovies.length > 0 ? (
              topMovies.map((movie) => (
                <div key={movie.id} className="movie-card" onClick={() => handleMovieClick(movie.id)}>
                  <img src={movie.thumbnail} alt={movie.title} />
                  <h3>{movie.title}</h3>
                </div>
              ))
            ) : (
              <p>No top movies</p>
            )}
          </div>
        </div>
        <div className="recommendations">
          <h2>Recommendations</h2>
          <div className="movie-row">
            {recommendations.length > 0 ? (
              recommendations.map((movie) => (
                <div key={movie.id} className="movie-card" onClick={() => handleMovieClick(movie.id)}>
                  <img src={movie.thumbnail} alt={movie.title} />
                  <h3>{movie.title}</h3>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveRecommendation(movie.id); }}>Remove</button>
                </div>
              ))
            ) : (
              <p>No recommendations</p>
            )}
          </div>
        </div>
        <div className="currently-watching-up-next">
          <div className="currently-watching">
            <h2>Currently Watching</h2>
            {currentlyWatching ? (
              <div className="movie-card" onClick={() => handleMovieClick(currentlyWatching.movie_id)}>
                <img src={`https://image.tmdb.org/t/p/w500/${currentlyWatching.poster}`} alt={currentlyWatching.title} />
                <h3>{currentlyWatching.title}</h3>
              </div>
            ) : (
              <p>No movie currently watching</p>
            )}
          </div>
          <div className="up-next">
            <h2>Up Next</h2>
            {upNext ? (
              <div className="movie-card" onClick={() => handleMovieClick(upNext.movie_id)}>
                <img src={`https://image.tmdb.org/t/p/w500/${upNext.poster}`} alt={upNext.title} />
                <h3>{upNext.title}</h3>
              </div>
            ) : (
              <p>No movie up next</p>
            )}
          </div>
        </div>
      </div>
      <div className="main-content">
        <div className="reviews-section">
          <h2>Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <h3>{review.movie_title}</h3>
                <img src={review.thumbnail} alt={`${review.movie_title} poster`} className="review-poster" />
                <p className="review-content">{review.content.charAt(0).toUpperCase() + review.content.slice(1)}</p>
                <span className="review-rating">{review.rating}/10</span>
              </div>
            ))
          ) : (
              <p>No reviews</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;