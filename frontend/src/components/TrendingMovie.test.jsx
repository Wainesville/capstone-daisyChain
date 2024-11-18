import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import TrendingMovies from './TrendingMovies';
import { BrowserRouter as Router } from 'react-router-dom';
import { fetchTrendingMovies } from '../api';

jest.mock('../api');

const mock = new MockAdapter(axios);

const mockMovies = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  title: `Movie ${index + 1}`,
  poster_path: `/path${index + 1}.jpg`,
}));

describe('TrendingMovies Component', () => {
  beforeEach(() => {
    fetchTrendingMovies.mockResolvedValue(mockMovies);
  });

  afterEach(() => {
    mock.reset();
    jest.resetAllMocks();
  });

  it('should render trending movies', async () => {
    render(
      <Router>
        <TrendingMovies />
      </Router>
    );

    await waitFor(() => {
      mockMovies.forEach((movie) => {
        expect(screen.getByText(movie.title)).toBeInTheDocument();
        expect(screen.getByAltText(movie.title)).toBeInTheDocument();
      });
    });
  });

  it('should handle pagination', async () => {
    render(
      <Router>
        <TrendingMovies />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Previous'));

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });
  });

  it('should navigate to movie detail page on movie card click', async () => {
    const navigate = jest.fn();
    render(
      <Router>
        <TrendingMovies />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Movie 1'));

    expect(navigate).toHaveBeenCalledWith('/movie/1');
  });

  it('should handle API error gracefully', async () => {
    fetchTrendingMovies.mockRejectedValue(new Error('Failed to fetch trending movies'));

    render(
      <Router>
        <TrendingMovies />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByText('Movie 1')).not.toBeInTheDocument();
    });
  });
});