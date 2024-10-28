import axios from 'axios';

const API_KEY = '8feb4db25b7185d740785fc6b6f0e850';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_SERVER_URL = 'http://localhost:5000/api'; // Your backend URL

// Helper function to deduplicate results based on ID
const deduplicateResults = (results) => {
    return Array.from(new Set(results.map(movie => movie.id)))
        .map(id => results.find(movie => movie.id === id));
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

// Fetch Movie Info
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
        console.error('Error fetching movie info:', error);
        return null; // Return null if there's an error
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
        console.error('Error fetching movie videos:', error);
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
        console.error('Error fetching movie images:', error);
        return []; // Return an empty array if there's an error
    }
};

// Fetch Trending Movies (with pagination)
export const fetchTrendingMovies = async (page = 1) => {
    try {
        const response = await axios.get(`${BASE_URL}/trending/movie/day`, {
            params: {
                api_key: API_KEY,
                page, // Pass the page number
            },
        });

        // Fetch the next page to get more results
        const secondPageResponse = await axios.get(`${BASE_URL}/trending/movie/day`, {
            params: {
                api_key: API_KEY,
                page: page + 1, // Fetch the next page
            },
        });

        // Combine both pages and deduplicate results
        const combinedResults = [
            ...response.data.results,
            ...secondPageResponse.data.results,
        ];

        return deduplicateResults(combinedResults).slice(0, 24); // Return the first 24 unique results
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
};

// Fetch Upcoming Movies (with pagination)
export const fetchUpcomingMovies = async (page = 1) => {
    try {
        const response = await axios.get(`${BASE_URL}/movie/upcoming`, {
            params: {
                api_key: API_KEY,
                page, // Pass the page number
            },
        });

        // Fetch the next page to get more results
        const secondPageResponse = await axios.get(`${BASE_URL}/movie/upcoming`, {
            params: {
                api_key: API_KEY,
                page: page + 1, // Fetch the next page
            },
        });

        // Combine both pages and deduplicate results
        const combinedResults = [
            ...response.data.results,
            ...secondPageResponse.data.results,
        ];

        return deduplicateResults(combinedResults).slice(0, 24); // Return the first 24 unique results
    } catch (error) {
        console.error('Error fetching upcoming movies:', error);
        return [];
    }
};

// Fetch Movies by Genre (with pagination)
export const fetchMoviesByGenre = async (genreId, page = 1) => {
    try {
        const response = await axios.get(`${BASE_URL}/discover/movie`, {
            params: {
                api_key: API_KEY,
                with_genres: genreId,
                sort_by: 'popularity.desc', // Sort by popularity
                page, // Pass the page number
            },
        });

        // Fetch the next page to get more results
        const secondPageResponse = await axios.get(`${BASE_URL}/discover/movie`, {
            params: {
                api_key: API_KEY,
                with_genres: genreId,
                sort_by: 'popularity.desc',
                page: page + 1, // Fetch the next page
            },
        });

        // Combine both pages and return the first 24 results
        const combinedResults = [
            ...response.data.results,
            ...secondPageResponse.data.results,
        ];

        return deduplicateResults(combinedResults).slice(0, 24); // Return the first 24 unique results
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
        return [];
    }
};

// Fetch Watchlist (pagination not needed here as we're fetching from the server)
export const fetchWatchlist = async () => {
    try {
        const response = await axios.get(`${API_SERVER_URL}/watchlist`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
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
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized: Invalid or expired token. Please log in again.');
        } else {
            console.error('Error adding to watchlist:', error.response ? error.response.data : error.message);
        }
        return false;
    }
};

// Remove from Watchlist
export const removeFromWatchlist = async (movieId) => {
    try {
        await axios.delete(`${API_SERVER_URL}/watchlist/remove/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return true;
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return false;
    }
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
        console.error('Error searching movies:', error);
        return [];
    }
};

// Login User
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_SERVER_URL}/auth/login`, credentials);
        
        // Log the response to verify what you are receiving
        console.log('Login Response:', response);
    
        localStorage.setItem('token', response.data.token); // Store token in local storage
        return response.data;
    } catch (error) {
        // Log error for debugging
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
        console.error('Error registering:', error);
        throw error;
    }
};


