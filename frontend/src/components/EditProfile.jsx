import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';
import MovieCollage from './MovieCollage';

function EditProfile() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [topMovies, setTopMovies] = useState(Array(5).fill(null));
  const [searchResults, setSearchResults] = useState(Array(5).fill([]));
  const [searchQueries, setSearchQueries] = useState(Array(5).fill(''));
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/login'; // Redirect to login page
          return;
        }

        const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { profile_picture, bio, favorite_genres, top_movies } = profileResponse.data;
        setProfilePicture(profile_picture);
        setBio(bio);
        setFavoriteGenres(favorite_genres || []);

        // Ensure top_movies is defined and is an array
        const topMoviesArray = Array.isArray(top_movies) ? top_movies : [];
        
        // Fetch details for top movies
        const topMoviesDetails = await Promise.all(
          topMoviesArray.map(async (movieId) => {
            if (movieId) {
              const movieResponse = await axios.get(`http://localhost:5000/api/movies/${movieId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return movieResponse.data;
            }
            return null;
          })
        );
        setTopMovies(topMoviesDetails.concat(Array(5 - topMoviesDetails.length).fill(null)));
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setError('Failed to fetch profile data');
      }
    };

    fetchProfileData();
  }, []);

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleFavoriteGenresChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFavoriteGenres([...favoriteGenres, value]);
    } else {
      setFavoriteGenres(favoriteGenres.filter((genre) => genre !== value));
    }
  };

  const handleSearchChange = (index, e) => {
    const newSearchQueries = [...searchQueries];
    newSearchQueries[index] = e.target.value;
    setSearchQueries(newSearchQueries);
  };

  const handleSearchSubmit = async (index, e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        params: {
          api_key: '8feb4db25b7185d740785fc6b6f0e850',
          query: searchQueries[index],
        },
      });
      const newSearchResults = [...searchResults];
      newSearchResults[index] = response.data.results;
      setSearchResults(newSearchResults);
    } catch (error) {
      console.error('Failed to search movies:', error);
      setError('Failed to search movies');
    }
  };

  const handleTopMoviesChange = (index, movie) => {
    const newTopMovies = [...topMovies];
    newTopMovies[index] = movie;
    setTopMovies(newTopMovies);

    // Clear the search results for the selected index
    const newSearchResults = [...searchResults];
    newSearchResults[index] = [];
    setSearchResults(newSearchResults);

    // Clear the search query for the selected index
    const newSearchQueries = [...searchQueries];
    newSearchQueries[index] = '';
    setSearchQueries(newSearchQueries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        window.location.href = '/login'; // Redirect to login page
        return;
      }

      const formData = new FormData();
      formData.append('profile_picture', profilePicture);
      formData.append('bio', bio);
      formData.append('favorite_genres', JSON.stringify(favoriteGenres));
      formData.append('top_movies', JSON.stringify(topMovies.map((movie) => movie?.id)));

      await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/user/${localStorage.getItem('username')}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="edit-profile">
      <MovieCollage />
      <div className="form-container">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input type="file" id="profilePicture" onChange={handleProfilePictureChange} />
            {profilePicture && (
              <img src={URL.createObjectURL(profilePicture)} alt="Profile Picture" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" value={bio} onChange={handleBioChange} />
          </div>
          <div className="form-group">
            <label>Favorite Genres</label>
            <div className="genres">
              {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi'].map((genre) => (
                <div key={genre}>
                  <input
                    type="checkbox"
                    id={genre}
                    value={genre}
                    checked={favoriteGenres.includes(genre)}
                    onChange={handleFavoriteGenresChange}
                  />
                  <label htmlFor={genre}>{genre}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Top 5 Movies</label>
            {topMovies.map((movie, index) => (
              <div key={index} className="top-movie">
                <div className="search-form">
                  <input
                    type="text"
                    value={searchQueries[index]}
                    onChange={(e) => handleSearchChange(index, e)}
                    placeholder={`Search for movie ${index + 1}`}
                  />
                  <button type="button" onClick={(e) => handleSearchSubmit(index, e)}>Search</button>
                </div>
                <div className="search-results">
                  {searchResults[index].map((result) => (
                    <div key={result.id} className="search-result">
                      <img src={`https://image.tmdb.org/t/p/w200/${result.poster_path}`} alt={result.title} />
                      <button type="button" onClick={() => handleTopMoviesChange(index, result)}>
                        {topMovies[index]?.id === result.id ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
                {movie && (
                  <div className="selected-movie">
                    <img src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`} alt={movie.title} />
                    <span>{index + 1}. {movie.title}</span>
                    <button type="button" onClick={() => handleTopMoviesChange(index, null)}>Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;