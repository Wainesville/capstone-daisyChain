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

import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token in localStorage to set initial login state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
  };

  const handleNewPost = (newPost) => {
    // Logic to handle new post if needed
  };

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
