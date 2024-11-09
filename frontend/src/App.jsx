import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import MovieInfo from './components/MovieInfo';
import Homepage from './components/Homepage';
import Register from './components/Register';
import Browse from './components/Browse';
import Watchlist from './components/Watchlists';
import TrendingMovies from './components/TrendingMovies';
import UpcomingMovies from './components/UpcomingMovies';
import MovieDetail from './components/movieDetail'; // Import the new MovieDetail component
import UserPage from './components/UserPage'; // Import the UserPage component

import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Check for token and username in localStorage to set initial login state
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      console.log('Username set from localStorage:', storedUsername);
    }
  }, []);

  const handleLogin = (response) => {
    const { user } = response;
    if (!user.username) {
        console.error('Username is undefined in handleLogin:', user);
        return;
    }
    setIsLoggedIn(true);
    setUsername(user.username);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('username', user.username);
    console.log('Username set on login:', user.username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    console.log('User logged out');
  };

  const handleNewPost = (newPost) => {
    // Logic to handle new post if needed
  };

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} username={username} />
        <div className="body-content"> {/* Add this div to separate the header and body */}
          <Routes>
            {/* Default route - redirect to homepage if logged in */}
            <Route path="/" element={isLoggedIn ? <Navigate to="/homepage" /> : <Login handleLogin={handleLogin} />} />
            <Route path="/login" element={<Login handleLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protect routes that require authentication */}
            <Route path="/movie/:id" element={isLoggedIn ? <MovieInfo /> : <Navigate to="/login" />} />
            <Route path="/browse" element={isLoggedIn ? <Browse /> : <Navigate to="/login" />} />
            <Route path="/watchlist" element={isLoggedIn ? <Watchlist /> : <Navigate to="/login" />} />
            <Route path="/homepage" element={isLoggedIn ? <Homepage onNewPost={handleNewPost} /> : <Navigate to="/login" />} />
            <Route path="/trending" element={isLoggedIn ? <TrendingMovies /> : <Navigate to="/login" />} />
            <Route path="/upcoming" element={isLoggedIn ? <UpcomingMovies /> : <Navigate to="/login" />} />
            <Route path="/movie-detail/:movieId" element={isLoggedIn ? <MovieDetail /> : <Navigate to="/login" />} />
            <Route path="/user/:username" element={isLoggedIn ? <UserPage /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;