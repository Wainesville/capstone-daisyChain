import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
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
        setTopMovies(top_movies || []);

        const moviesResponse = await axios.get('http://localhost:5000/api/movies', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllMovies(moviesResponse.data);
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

  const handleTopMoviesChange = (movieId) => {
    if (topMovies.includes(movieId)) {
      setTopMovies(topMovies.filter((id) => id !== movieId));
    } else if (topMovies.length < 5) {
      setTopMovies([...topMovies, movieId]);
    }
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
      formData.append('top_movies', JSON.stringify(topMovies));

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
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture</label>
          <input type="file" id="profilePicture" onChange={handleProfilePictureChange} />
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
          <div className="movies">
            {allMovies.map((movie) => (
              <div key={movie.id}>
                <input
                  type="checkbox"
                  id={`movie-${movie.id}`}
                  value={movie.id}
                  checked={topMovies.includes(movie.id)}
                  onChange={() => handleTopMoviesChange(movie.id)}
                />
                <label htmlFor={`movie-${movie.id}`}>{movie.title}</label>
              </div>
            ))}
          </div>
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;