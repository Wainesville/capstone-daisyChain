import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Watchlist from './Watchlist';
import { BrowserRouter as Router } from 'react-router-dom';

const mock = new MockAdapter(axios);

const mockWatchlist = [
  { movie_id: 1, title: 'Movie 1', poster: '/path1.jpg', currently_watching: true, next_up: false },
  { movie_id: 2, title: 'Movie 2', poster: '/path2.jpg', currently_watching: false, next_up: true },
  { movie_id: 3, title: 'Movie 3', poster: '/path3.jpg', currently_watching: false, next_up: false },
];

describe('Watchlist Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    mock.onGet('http://localhost:5000/api/watchlist').reply(200, mockWatchlist);
    mock.onDelete('http://localhost:5000/api/watchlist/remove/1').reply(200);
    mock.onPut('http://localhost:5000/api/watchlist/currently-watching/2').reply(200);
    mock.onPut('http://localhost:5000/api/watchlist/next-up/3').reply(200);
  });

  afterEach(() => {
    mock.reset();
    localStorage.removeItem('token');
  });

  it('should render watchlist movies', async () => {
    render(
      <Router>
        <Watchlist />
      </Router>
    );

    await waitFor(() => {
      mockWatchlist.forEach((movie) => {
        expect(screen.getByText(movie.title)).toBeInTheDocument();
        expect(screen.getByAltText(movie.title)).toBeInTheDocument();
      });
    });
  });

  it('should handle removing a movie from the watchlist', async () => {
    render(
      <Router>
        <Watchlist />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.queryByText('Movie 1')).not.toBeInTheDocument();
    });
  });

  it('should handle setting a movie as currently watching', async () => {
    render(
      <Router>
        <Watchlist />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Currently Watching'));

    await waitFor(() => {
      expect(screen.getByText('Movie 2')).toHaveClass('first-spot');
    });
  });

  it('should handle setting a movie as next up', async () => {
    render(
      <Router>
        <Watchlist />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Movie 3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next Up'));

    await waitFor(() => {
      expect(screen.getByText('Movie 3')).toHaveClass('second-spot');
    });
  });

  it('should display an error message if fetching watchlist fails', async () => {
    mock.onGet('http://localhost:5000/api/watchlist').reply(500);

    render(
      <Router>
        <Watchlist />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Error fetching watchlist')).toBeInTheDocument();
    });
  });
});