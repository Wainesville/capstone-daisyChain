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
import ViewUserPage from './components/ViewUserPage'; // Import the ViewUserPage component
import ViewUsers from './components/ViewUsers'; // Import the ViewUsers component
import ModalWrapper from './components/ModalWrapper'; // Import the ModalWrapper component

import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

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

  const openModal = (movieId) => {
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} username={username} />
      <Routes>
        <Route path="/" element={isLoggedIn ? <Homepage openModal={openModal} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login handleLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={isLoggedIn ? <Browse openModal={openModal} /> : <Navigate to="/login" />} />
        <Route path="/watchlist" element={isLoggedIn ? <Watchlist openModal={openModal} /> : <Navigate to="/login" />} />
        <Route path="/trending" element={isLoggedIn ? <TrendingMovies openModal={openModal} /> : <Navigate to="/login" />} />
        <Route path="/upcoming" element={isLoggedIn ? <UpcomingMovies openModal={openModal} /> : <Navigate to="/login" />} />
        <Route path="/movie/:id" element={isLoggedIn ? <MovieInfo /> : <Navigate to="/login" />} />
        <Route path="/user/:username" element={isLoggedIn ? <UserPage /> : <Navigate to="/login" />} />
        <Route path="/view-user/:username" element={isLoggedIn ? <ViewUserPage /> : <Navigate to="/login" />} />
        <Route path="/view-users" element={isLoggedIn ? <ViewUsers /> : <Navigate to="/login" />} /> {/* Add the ViewUsers route */}
        <Route path="/edit-profile" element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" />} /> {/* Add the EditProfile route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ModalWrapper isOpen={isModalOpen} onRequestClose={closeModal}>
        {selectedMovieId && <MovieInfo id={selectedMovieId} onClose={closeModal} />}
      </ModalWrapper>
    </Router>
  );
}

export default App;