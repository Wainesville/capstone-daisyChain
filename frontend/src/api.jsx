import axios from 'axios';

const API_KEY = '8feb4db25b7185d740785fc6b6f0e850';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_SERVER_URL = 'http://localhost:5000/api'; // Your backend URL

// Helper function to deduplicate results based on ID
const deduplicateResults = (results) => {
  return Array.from(new Set(results.map(movie => movie.id)))
    .map(id => results.find(movie => movie.id === id));
};

// Helper function to fetch multiple pages
const fetchMultiplePages = async (url, params, pages = 2) => {
  try {
    const results = [];
    for (let page = 1; page <= pages; page++) {
      const response = await axios.get(url, { params: { ...params, page } });
      results.push(...response.data.results);
    }
    return deduplicateResults(results).slice(0, 24); // Return the first 24 unique results
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.response ? error.response.data : error.message);
    return [];
  }
};

// Fetch Genres
export const fetchGenres = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
      params: {
        api_key: API_KEY,
      },
    });
    return response.data.genres; // Return the list of genres
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

// Fetch Movie Info (with credits for director and actors)
export const fetchMovieInfo = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: API_KEY,
        append_to_response: 'credits', // Include credits in the response
      },
    });
    return response.data; // Return detailed movie info with credits
  } catch (error) {
    console.error('Error fetching movie info:', error.response ? error.response.data : error.message);
    return null; // Return null if there's an error
  }
};

// Fetch Movie Reviews
export const fetchMovieReviews = async (movieId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_SERVER_URL}/reviews/movie/${movieId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the list of reviews for the movie
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return []; // Return an empty array if no reviews are found
    }
    console.error('Error fetching movie reviews:', error.response ? error.response.data : error.message);
    return []; // Return an empty array if there's an error
  }
};

// Fetch Watchlist
export const fetchWatchlist = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    window.location.href = '/login'; // Redirect to login page
    return;
  }
  try {
    const response = await axios.get(`${API_SERVER_URL}/watchlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error('Unauthorized: Invalid or expired token. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      window.location.href = '/login'; // Redirect to login page
    } else {
      console.error('Error fetching watchlist:', error.response ? error.response.data : error.message);
    }
    throw error;
  }
};

// Add to Watchlist
export const addToWatchlist = async (movieId, title, poster) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error("No token found! Please log in.");
    return false;
  }

  try {
    await axios.post(`${API_SERVER_URL}/watchlist/add`, {
      movieId,
      title,
      poster,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error('Unauthorized: Invalid or expired token. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      window.location.href = '/login'; // Redirect to login page
    } else {
      console.error('Error adding to watchlist:', error.response ? error.response.data : error.message);
    }
    return false;
  }
};

// Remove from Watchlist
export const removeFromWatchlist = async (movieId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    window.location.href = '/login'; // Redirect to login page
    return;
  }
  try {
    await axios.delete(`${API_SERVER_URL}/watchlist/remove/${movieId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error removing movie from watchlist:', error);
    throw error;
  }
};

// Fetch Movie Videos
export const fetchMovieVideos = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos`, {
      params: {
        api_key: API_KEY,
      },
    });
    return response.data.results; // Return the list of video results (trailers, etc.)
  } catch (error) {
    console.error('Error fetching movie videos:', error.response ? error.response.data : error.message);
    return []; // Return an empty array if there's an error
  }
};

// Fetch Movie Images
export const fetchMovieImages = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}/images`, {
      params: {
        api_key: API_KEY,
      },
    });
    return response.data; // Return the list of images for the movie
  } catch (error) {
    console.error('Error fetching movie images:', error.response ? error.response.data : error.message);
    return []; // Return an empty array if there's an error
  }
};

// Fetch Trending Movies (with pagination)
export const fetchTrendingMovies = async (page = 1) => {
  return fetchMultiplePages(`${BASE_URL}/trending/movie/day`, { api_key: API_KEY }, 2);
};

// Fetch Upcoming Movies (with pagination)
export const fetchUpcomingMovies = async (page = 1) => {
  return fetchMultiplePages(`${BASE_URL}/movie/upcoming`, { api_key: API_KEY }, 2);
};

// Fetch Movies by Genre (with pagination)
export const fetchMoviesByGenre = async (genreId, page = 1) => {
  return fetchMultiplePages(`${BASE_URL}/discover/movie`, { api_key: API_KEY, with_genres: genreId, sort_by: 'popularity.desc' }, 2);
};

// Search Movies
export const searchMovies = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query: query,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error.response ? error.response.data : error.message);
    return [];
  }
};

// Login User
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_SERVER_URL}/auth/login`, credentials);
    console.log('Login response:', response.data); // Add this line
    localStorage.setItem('token', response.data.token); // Store token in local storage
    return response.data; // Ensure that the response data includes the user object
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_SERVER_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Fetch User Data
export const fetchUserData = async (username) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    window.location.href = '/login'; // Redirect to login page
    return;
  }
  try {
    const response = await axios.get(`${API_SERVER_URL}/users/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized: Invalid or expired token. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      window.location.href = '/login'; // Redirect to login page
    } else {
      console.error('Error fetching user data:', error.response ? error.response.data : error.message);
    }
    throw error;
  }
};

// Fetch Watchlist by User ID
export const fetchWatchlistByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_SERVER_URL}/watchlist/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist by user ID:', error.response ? error.response.data : error.message);
    return [];
  }
};

// Fetch User Reviews
export const fetchUserReviews = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_SERVER_URL}/reviews/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Fetch Recommendations
export const fetchRecommendations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    window.location.href = '/login'; // Redirect to login page
    return;
  }
  try {
    const response = await axios.get(`${API_SERVER_URL}/recommendations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized: Invalid or expired token. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      window.location.href = '/login'; // Redirect to login page
    } else {
      console.error('Error fetching recommendations:', error.response ? error.response.data : error.message);
    }
    throw error;
  }
};

// Fetch All Reviews
export const fetchAllReviews = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_SERVER_URL}/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return []; // Return an empty array if there's an error
  }
};