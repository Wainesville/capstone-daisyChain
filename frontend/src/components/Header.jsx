import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './header.css'; // Ensure to import the CSS file for styles

function Header({ isLoggedIn, handleLogout, username }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <header className="header">
      <h1>Daisy Chain</h1>
      <nav>
        <ul>
          {!isLoggedIn ? (
            <>
              <li><Link to="/login" className="nav-link">Login</Link></li>
              <li><Link to="/register" className="nav-link">Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/browse" className="nav-link">Browse/Search</Link></li>
              <li><Link to="/watchlist" className="nav-link">Watchlist</Link></li>
              <li><Link to="/trending" className="nav-link">Trending Movies</Link></li>
              <li><Link to="/upcoming" className="nav-link">Upcoming Movies</Link></li>
              <li><Link to={`/user/${username}`} className="nav-link">Profile</Link></li> {/* Link to user page */}
              <li><Link to="/view-users" className="nav-link">View Users</Link></li> {/* Link to view users page */}
              <li>
                <button onClick={handleLogoutClick} className="logout-button">Logout</button>
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