import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ViewUserPage from './ViewUserPage';
import { BrowserRouter as Router } from 'react-router-dom';

const mock = new MockAdapter(axios);

const mockUser = {
  id: 1,
  username: 'testuser',
  profile_picture: 'http://example.com/profile.jpg',
  recommendations: [101, 102],
  top_movies: [201, 202],
};

const mockWatchlist = [
  { id: 301, title: 'Currently Watching Movie', poster: 'http://example.com/currently-watching.jpg' },
  { id: 302, title: 'Up Next Movie', poster: 'http://example.com/up-next.jpg' },
];

const mockReviews = [
  {
    id: 1,
    movie_title: 'Reviewed Movie 1',
    thumbnail: 'http://example.com/review1.jpg',
    content: 'Great movie!',
    rating: 9,
  },
  {
    id: 2,
    movie_title: 'Reviewed Movie 2',
    thumbnail: 'http://example.com/review2.jpg',
    content: 'Not bad.',
    rating: 6,
  },
];

const mockRecommendations = [
  { id: 101, title: 'Recommended Movie 1', thumbnail: 'http://example.com/recommendation1.jpg' },
  { id: 102, title: 'Recommended Movie 2', thumbnail: 'http://example.com/recommendation2.jpg' },
];

const mockTopMovies = [
  { id: 201, title: 'Top Movie 1', thumbnail: 'http://example.com/top1.jpg' },
  { id: 202, title: 'Top Movie 2', thumbnail: 'http://example.com/top2.jpg' },
];

describe('ViewUserPage Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    mock.onGet('http://localhost:5000/api/users/testuser').reply(200, mockUser);
    mock.onGet('http://localhost:5000/api/watchlist/1').reply(200, mockWatchlist);
    mock.onGet('http://localhost:5000/api/reviews/user/1').reply(200, mockReviews);
    mock.onGet('http://localhost:5000/api/movies/101').reply(200, mockRecommendations[0]);
    mock.onGet('http://localhost:5000/api/movies/102').reply(200, mockRecommendations[1]);
    mock.onGet('http://localhost:5000/api/movies/201').reply(200, mockTopMovies[0]);
    mock.onGet('http://localhost:5000/api/movies/202').reply(200, mockTopMovies[1]);
  });

  afterEach(() => {
    mock.reset();
    localStorage.removeItem('token');
  });

  it('should render user details and sections', async () => {
    render(
      <Router>
        <ViewUserPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByAltText("testuser's profile")).toBeInTheDocument();
      expect(screen.getByText('Top 5 Movies')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Currently Watching')).toBeInTheDocument();
      expect(screen.getByText('Up Next')).toBeInTheDocument();
      expect(screen.getByText('Reviews')).toBeInTheDocument();
    });
  });

  it('should render top movies', async () => {
    render(
      <Router>
        <ViewUserPage />
      </Router>
    );

    await waitFor(() => {
      mockTopMovies.forEach((movie) => {
        expect(screen.getByText(movie.title)).toBeInTheDocument();
        expect(screen.getByAltText(movie.title)).toBeInTheDocument();
      });
    });
  });

  it('should render recommendations', async () => {
    render(
      <Router>
        <ViewUserPage />
      </Router>
    );

    await waitFor(() => {
      mockRecommendations.forEach((movie) => {
        expect(screen.getByText(movie.title)).toBeInTheDocument();
        expect(screen.getByAltText(movie.title)).toBeInTheDocument();
      });
    });
  });

  it('should render currently watching and up next movies', async () => {
    render(
      <Router>
        <ViewUserPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Currently Watching Movie')).toBeInTheDocument();
      expect(screen.getByAltText('Currently Watching Movie')).toBeInTheDocument();
      expect(screen.getByText('Up Next Movie')).toBeInTheDocument();
      expect(screen.getByAltText('Up Next Movie')).toBeInTheDocument();
    });
  });

  it('should render reviews', async () => {
    render(
      <Router>
        <ViewUserPage />
      </Router>
    );

    await waitFor(() => {
      mockReviews.forEach((review) => {
        expect(screen.getByText(review.movie_title)).toBeInTheDocument();
        expect(screen.getByAltText(`${review.movie_title} poster`)).toBeInTheDocument();
        expect(screen.getByText(review.content.charAt(0).toUpperCase() + review.content.slice(1))).toBeInTheDocument();
        expect(screen.getByText(`${review.rating}/10`)).toBeInTheDocument();
      });
    });
  });

  it('should display an error message if user data fetch fails', async () => {
    mock.onGet('http://localhost:5000/api/users/testuser').reply(500);

    render(
      <Router>
        <ViewUserPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});