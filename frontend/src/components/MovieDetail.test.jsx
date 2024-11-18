import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import MovieDetail from './MovieDetail';
import { BrowserRouter as Router } from 'react-router-dom';

const mock = new MockAdapter(axios);

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/test.jpg',
  thumbnail: 'http://example.com/test.jpg',
  logo: 'http://example.com/logo.jpg',
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

describe('MovieDetail Component', () => {
  beforeEach(() => {
    localStorage.setItem('reviewMovie', JSON.stringify(mockMovie));
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'fake-user-id');
    mock.onGet(`http://localhost:5000/api/reviews/movie/${mockMovie.id}`).reply(200, mockReviews);
  });

  afterEach(() => {
    mock.reset();
    localStorage.removeItem('reviewMovie');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    jest.resetAllMocks();
  });

  it('should render movie details and reviews', async () => {
    render(
      <Router>
        <MovieDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByAltText('Test Movie thumbnail')).toBeInTheDocument();
      expect(screen.getByAltText('Test Movie logo')).toBeInTheDocument();
      expect(screen.getByText('Great movie!')).toBeInTheDocument();
      expect(screen.getByText('Not bad.')).toBeInTheDocument();
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
        <MovieDetail />
      </Router>
    );

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

  it('should display an error message if reviews fetch fails', async () => {
    mock.onGet(`http://localhost:5000/api/reviews/movie/${mockMovie.id}`).reply(500);

    render(
      <Router>
        <MovieDetail />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reviews')).toBeInTheDocument();
    });
  });

  it('should display an error message if comment submission fails', async () => {
    mock.onPost('http://localhost:5000/api/reviews').reply(500);

    render(
      <Router>
        <MovieDetail />
      </Router>
    );

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