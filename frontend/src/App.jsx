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
import UserPage from './components/UserPage';
import EditProfile from './components/EditProfile'; // Import the EditProfile component

import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      console.log('Username set from localStorage:', storedUsername);
    } else {
      console.log('No token or username found in localStorage');
    }
  }, []);

  const handleLogin = (response) => {
    const { user, token } = response;
    if (!user.username) {
      console.error('Username is undefined in handleLogin:', user);
      return;
    }
    setIsLoggedIn(true);
    setUsername(user.username);
    localStorage.setItem('token', token);
    localStorage.setItem('username', user.username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} username={username} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login handleLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/trending" element={<TrendingMovies />} />
        <Route path="/upcoming" element={<UpcomingMovies />} />
        <Route path="/movie/:id" element={<MovieInfo />} />
        <Route path="/user/:username" element={<UserPage />} />
        <Route path="/edit-profile" element={<EditProfile />} /> {/* Add the EditProfile route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;