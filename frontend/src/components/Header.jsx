import React from 'react';
import { Link } from 'react-router-dom';
import './header.css'; // Ensure to import the CSS file for styles

function Header({ isLoggedIn, handleLogout, username }) {
  return (
    <header className="header">
      <h1>Movie Tracker</h1>
      <nav>
        <ul>
          {!isLoggedIn ? (
            <>
              <li><Link to="/login" className="nav-link">Login</Link></li>
              <li><Link to="/register" className="nav-link">Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/browse" className="nav-link">Browse</Link></li>
              <li><Link to="/watchlist" className="nav-link">Watchlist</Link></li>
              <li><Link to="/homepage" className="nav-link">Reviews</Link></li>
              <li><Link to="/trending" className="nav-link">Trending Movies</Link></li>
              <li><Link to="/upcoming" className="nav-link">Upcoming Movies</Link></li>
              <li>
                <button onClick={handleLogout} className="logout-button">Logout</button>
              </li>
              <li className="username">{username}</li> {/* Display the username */}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
