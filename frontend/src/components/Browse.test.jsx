import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import Browse from '../components/Browse';
import { fetchGenres, fetchMoviesByGenre, searchMovies } from '../api';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../api');

const mockGenres = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Comedy' },
];

const ITEMS_PER_PAGE = 24;

const mockMovies = Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
  id: index + 1,
  title: `Movie ${index + 1}`,
  poster_path: `/path${index + 1}.jpg`,
}));

describe('Browse Component', () => {
  beforeEach(() => {
    fetchGenres.mockResolvedValue(mockGenres);
    fetchMoviesByGenre.mockResolvedValue(mockMovies);
    searchMovies.mockResolvedValue(mockMovies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render genres and allow selecting a genre', async () => {
    await act(async () => {
      render(
        <Router>
          <Browse />
        </Router>
      );
    });

    await waitFor(() => {
      expect(fetchGenres).toHaveBeenCalled();
    });

    mockGenres.forEach((genre) => {
      expect(screen.getByText(genre.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Action'));

    await waitFor(() => {
      expect(fetchMoviesByGenre).toHaveBeenCalledWith(1, 1);
    });

    mockMovies.forEach((movie) => {
      expect(screen.getByText(movie.title)).toBeInTheDocument();
    });
  });

  it('should search for movies', async () => {
    await act(async () => {
      render(
        <Router>
          <Browse />
        </Router>
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Search for a movie...'), {
      target: { value: 'Movie' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(searchMovies).toHaveBeenCalledWith('Movie');
    });

    mockMovies.forEach((movie) => {
      expect(screen.getByText(movie.title)).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    await act(async () => {
      render(
        <Router>
          <Browse />
        </Router>
      );
    });

    fireEvent.click(screen.getByText('Action'));

    await waitFor(() => {
      expect(fetchMoviesByGenre).toHaveBeenCalledWith(1, 1);
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(fetchMoviesByGenre).toHaveBeenCalledWith(1, 2);
    });

    fireEvent.click(screen.getByText('Previous'));

    await waitFor(() => {
      expect(fetchMoviesByGenre).toHaveBeenCalledWith(1, 1);
    });
  });
});