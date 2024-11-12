import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserPage.css';

const UserPage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentlyWatching, setCurrentlyWatching] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [upNext, setUpNext] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

        const watchlistResponse = await axios.get(`http://localhost:5000/api/watchlist`, {
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
              const movieResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return movieResponse.data;
            })
          );
          setRecommendations(recommendationsDetails);
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
              const movieResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return movieResponse.data;
            })
          );
          setTopMovies(topMoviesDetails);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('User not found');
      }
    };

    fetchUserData();
  }, [username]);

  if (error) return <div>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-page">
      <div className="user-header">
        <img src={user.profile_picture || defaultProfilePicture} alt={`${user.username}'s profile`} className="user-image" />
        <h1>{user.username}</h1>
        <button onClick={() => navigate(`/edit-profile`)}>Edit Profile</button>
      </div>
      <div className="user-info">
        <div className="currently-watching">
          <h2>Currently Watching</h2>
          {currentlyWatching ? (
            <div className="movie-card">
              <Link to={`/movie/${currentlyWatching.id}`}>
                <img src={currentlyWatching.poster} alt={currentlyWatching.title} />
                <h3>{currentlyWatching.title}</h3>
              </Link>
            </div>
          ) : (
            <p>No movie currently watching</p>
          )}
        </div>
        <div className="up-next">
          <h2>Up Next</h2>
          {upNext ? (
            <div className="movie-card">
              <Link to={`/movie/${upNext.id}`}>
                <img src={upNext.poster} alt={upNext.title} />
                <h3>{upNext.title}</h3>
              </Link>
            </div>
          ) : (
            <p>No movie up next</p>
          )}
        </div>
        <div className="top-movies">
          <h2>Top 5 Movies</h2>
          {topMovies.length > 0 ? (
            topMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <Link to={`/movie/${movie.id}`}>
                  <img src={movie.thumbnail} alt={movie.title} />
                  <h3>{movie.title}</h3>
                </Link>
              </div>
            ))
          ) : (
            <p>No top movies</p>
          )}
        </div>
        <div className="recommendations">
          <h2>Recommendations</h2>
          {recommendations.length > 0 ? (
            recommendations.map((movie) => (
              <div key={movie.id} className="movie-card">
                <Link to={`/movie/${movie.id}`}>
                  <img src={movie.thumbnail} alt={movie.title} />
                  <h3>{movie.title}</h3>
                </Link>
              </div>
            ))
          ) : (
            <p>No recommendations</p>
          )}
        </div>
      </div>
      <div className="main-content">
        <div className="reviews-section">
          <h2>Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <h3>{review.movie_title}</h3>
                <p>{review.content}</p>
                <p>Rating: {review.rating}/10</p>
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