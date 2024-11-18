import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import MovieInfo from './MovieInfo';
import { BrowserRouter as Router } from 'react-router-dom';
import { fetchMovieInfo, fetchWatchlist, fetchMovieImages, fetchMovieReviews } from '../api';

jest.mock('../api');

const mock = new MockAdapter(axios);

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test.jpg',
  backdrop_path: '/backdrop.jpg',
  overview: 'This is a test movie.',
  runtime: 120,
  vote_average: 8.5,
  release_date: '2021-01-01',
  credits: {
    crew: [{ job: 'Director', name: 'Test Director' }],
    cast: [
      { name: 'Actor 1' },
      { name: 'Actor 2' },
      { name: 'Actor 3' },
      { name: 'Actor 4' },
      { name: 'Actor 5' },
    ],
  },
};

const mockReviews = [
  {
    id: 1,
    movie_id: 1,
    movie_title: 'Test Movie',
    username: 'user1',
    content: 'Great movie!',
    recommendation: true,
    rating: 9,
    thumbnail: 'http://example.com/test.jpg',
  },
  {
    id: 2,
    movie_id: 1,
    movie_title: 'Test Movie',
    username: 'user2',
    content: 'Not bad.',
    recommendation: false,
    rating: 6,
    thumbnail: 'http://example.com/test.jpg',
  },
];

describe('MovieInfo Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'fake-user-id');
    fetchMovieInfo.mockResolvedValue(mockMovie);
    fetchWatchlist.mockResolvedValue([]);
    fetchMovieImages.mockResolvedValue({ backdrops: [{ file_path: '/backdrop.jpg' }] });
    fetchMovieReviews.mockResolvedValue(mockReviews);
    mock.onGet(`https://api.themoviedb.org/3/movie/1/videos`).reply(200, {
      results: [{ type: 'Trailer', key: 'test-trailer-key' }],
    });
  });

  afterEach(() => {
    mock.reset();
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    jest.resetAllMocks();
  });

  it('should render movie details and reviews', async () => {
    render(
      <Router>
        <MovieInfo />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('This is a test movie.')).toBeInTheDocument();
      expect(screen.getByText('120 minutes')).toBeInTheDocument();
      expect(screen.getByText('8.5/10')).toBeInTheDocument();
      expect(screen.getByText('2021-01-01')).toBeInTheDocument();
      expect(screen.getByText('Great movie!')).toBeInTheDocument();
      expect(screen.getByText('Not bad.')).toBeInTheDocument();
    });
  });

  it('should handle watchlist toggle', async () => {
    render(
      <Router>
        <MovieInfo />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add to Watchlist'));

    await waitFor(() => {
      expect(screen.getByText('Remove from Watchlist')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove from Watchlist'));

    await waitFor(() => {
      expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();
    });
  });

  it('should handle comment submission', async () => {
    mock.onPost('http://localhost:5000/api/reviews').reply(200, {
      id: 3,
      movie_id: 1,
      movie_title: 'Test Movie',
      username: 'user3',
      content: 'Amazing!',
      recommendation: true,
      rating: 10,
      thumbnail: 'http://example.com/test.jpg',
    });

    render(
      <Router>
        <MovieInfo />
      </Router>
    );

    fireEvent.click(screen.getByText('Write a Review'));

    fireEvent.change(screen.getByPlaceholderText('Leave a comment/review'), {
      target: { value: 'Amazing!' },
    });
    fireEvent.click(screen.getByText('👍'));
    fireEvent.change(screen.getByLabelText('Rating: 5'), { target: { value: 10 } });
    fireEvent.click(screen.getByText('Post Review'));

    await waitFor(() => {
      expect(screen.getByText('Amazing!')).toBeInTheDocument();
    });
  });

  it('should display an error message if movie info fetch fails', async () => {
    fetchMovieInfo.mockRejectedValue(new Error('Failed to fetch movie info'));

    render(
      <Router>
        <MovieInfo />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load movie information.')).toBeInTheDocument();
    });
  });

  it('should display an error message if comment submission fails', async () => {
    mock.onPost('http://localhost:5000/api/reviews').reply(500);

    render(
      <Router>
        <MovieInfo />
      </Router>
    );

    fireEvent.click(screen.getByText('Write a Review'));

    fireEvent.change(screen.getByPlaceholderText('Leave a comment/review'), {
      target: { value: 'Amazing!' },
    });
    fireEvent.click(screen.getByText('👍'));
    fireEvent.change(screen.getByLabelText('Rating: 5'), { target: { value: 10 } });
    fireEvent.click(screen.getByText('Post Review'));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit comment')).toBeInTheDocument();
    });
  });
});