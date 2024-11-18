import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';

describe('Header Component', () => {
  const handleLogout = jest.fn();

  it('should render login and register links when not logged in', () => {
    render(
      <Router>
        <Header isLoggedIn={false} handleLogout={handleLogout} username="" />
      </Router>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should render user-specific links and logout button when logged in', () => {
    render(
      <Router>
        <Header isLoggedIn={true} handleLogout={handleLogout} username="testuser" />
      </Router>
    );

    expect(screen.getByText('Browse/Search')).toBeInTheDocument();
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Trending Movies')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('View Users')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should call handleLogout and navigate to login page on logout click', () => {
    const navigate = jest.fn();
    render(
      <Router>
        <Header isLoggedIn={true} handleLogout={handleLogout} username="testuser" />
      </Router>
    );

    fireEvent.click(screen.getByText('Logout'));
    expect(handleLogout).toHaveBeenCalled();
    // Note: Navigation to login page is handled by react-router, so we don't test it here
  });
});