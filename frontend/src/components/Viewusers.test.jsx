import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ViewUsers from './ViewUsers';
import { BrowserRouter as Router } from 'react-router-dom';

const mock = new MockAdapter(axios);

const mockNewestUsers = [
  { id: 1, username: 'user1', profile_picture: 'http://example.com/user1.jpg' },
  { id: 2, username: 'user2', profile_picture: 'http://example.com/user2.jpg' },
];

const mockSearchResults = [
  { id: 3, username: 'searchuser1', profile_picture: 'http://example.com/searchuser1.jpg' },
  { id: 4, username: 'searchuser2', profile_picture: 'http://example.com/searchuser2.jpg' },
];

describe('ViewUsers Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    mock.onGet('http://localhost:5000/api/users/newest').reply(200, mockNewestUsers);
    mock.onGet('http://localhost:5000/api/users/search?query=search').reply(200, mockSearchResults);
  });

  afterEach(() => {
    mock.reset();
    localStorage.removeItem('token');
  });

  it('should render newest users', async () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    await waitFor(() => {
      mockNewestUsers.forEach((user) => {
        expect(screen.getByText(user.username)).toBeInTheDocument();
        expect(screen.getByAltText(`${user.username}'s profile`)).toBeInTheDocument();
      });
    });
  });

  it('should handle search and display results', async () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'search' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      mockSearchResults.forEach((user) => {
        expect(screen.getByText(user.username)).toBeInTheDocument();
        expect(screen.getByAltText(`${user.username}'s profile`)).toBeInTheDocument();
      });
    });
  });

  it('should display an error message if fetching newest users fails', async () => {
    mock.onGet('http://localhost:5000/api/users/newest').reply(500);

    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch newest users')).toBeInTheDocument();
    });
  });

  it('should display an error message if search fails', async () => {
    mock.onGet('http://localhost:5000/api/users/search?query=search').reply(500);

    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'search' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
  });
});