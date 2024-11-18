import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Homepage from './Homepage';
import { BrowserRouter as Router } from 'react-router-dom';
import { fetchAllReviews } from '../api';

jest.mock('../api');

const mock = new MockAdapter(axios);

const mockReviews = [
  {
    id: 1,
    movie_id: 101,
    movie_title: 'Movie 1',
    username: 'user1',
    content: 'Great movie!',
    recommendation: true,
    rating: 9,
    likes: 5,
    thumbnail: 'http://example.com/movie1.jpg',
  },
  {
    id: 2,
    movie_id: 102,
    movie_title: 'Movie 2',
    username: 'user2',
    content: 'Not bad.',
    recommendation: false,
    rating: 6,
    likes: 2,
    thumbnail: 'http://example.com/movie2.jpg',
  },
];

const mockComments = {
  1: [
    { id: 1, username: 'commenter1', content: 'I agree!' },
    { id: 2, username: 'commenter2', content: 'Nice review!' },
  ],
  2: [
    { id: 3, username: 'commenter3', content: 'I disagree.' },
  ],
};

describe('Homepage Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'fake-user-id');
    fetchAllReviews.mockResolvedValue(mockReviews);
    mock.onGet('http://localhost:5000/api/reviews/1/likes').reply(200, { likes: 5 });
    mock.onGet('http://localhost:5000/api/reviews/2/likes').reply(200, { likes: 2 });
    mock.onGet('http://localhost:5000/api/reviews/1/comments').reply(200, mockComments[1]);
    mock.onGet('http://localhost:5000/api/reviews/2/comments').reply(200, mockComments[2]);
  });

  afterEach(() => {
    mock.reset();
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    jest.resetAllMocks();
  });

  it('should render reviews', async () => {
    render(
      <Router>
        <Homepage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Great movie!')).toBeInTheDocument();
      expect(screen.getByText('user1 says:')).toBeInTheDocument();
      expect(screen.getByText('👍')).toBeInTheDocument();
      expect(screen.getByText('9/10')).toBeInTheDocument();

      expect(screen.getByText('Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Not bad.')).toBeInTheDocument();
      expect(screen.getByText('user2 says:')).toBeInTheDocument();
      expect(screen.getByText('👎')).toBeInTheDocument();
      expect(screen.getByText('6/10')).toBeInTheDocument();
    });
  });

  it('should handle like toggle', async () => {
    render(
      <Router>
        <Homepage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('5 likes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Like')[0]);

    await waitFor(() => {
      expect(screen.getByText('6 likes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Unlike')[0]);

    await waitFor(() => {
      expect(screen.getByText('5 likes')).toBeInTheDocument();
    });
  });

  it('should handle comment submission', async () => {
    render(
      <Router>
        <Homepage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('I agree!')).toBeInTheDocument();
    });

    fireEvent.change(screen.getAllByPlaceholderText('Write a comment...')[0], {
      target: { value: 'New comment' },
    });
    fireEvent.click(screen.getAllByText('Post Comment')[0]);

    await waitFor(() => {
      expect(screen.getByText('New comment')).toBeInTheDocument();
    });
  });

  it('should display an error message if reviews fetch fails', async () => {
    fetchAllReviews.mockRejectedValue(new Error('Failed to fetch reviews'));

    render(
      <Router>
        <Homepage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reviews')).toBeInTheDocument();
    });
  });
});