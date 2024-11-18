import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import MovieCollage from './MovieCollage';

const mock = new MockAdapter(axios);

const mockMovies = [
  { id: 1, title: 'Movie 1', poster_path: '/path1.jpg' },
  { id: 2, title: 'Movie 2', poster_path: '/path2.jpg' },
  { id: 3, title: 'Movie 3', poster_path: '/path3.jpg' },
  { id: 4, title: 'Movie 4', poster_path: '/path4.jpg' },
  { id: 5, title: 'Movie 5', poster_path: '/path5.jpg' },
  { id: 6, title: 'Movie 6', poster_path: '/path6.jpg' },
  { id: 7, title: 'Movie 7', poster_path: '/path7.jpg' },
  { id: 8, title: 'Movie 8', poster_path: '/path8.jpg' },
  { id: 9, title: 'Movie 9', poster_path: '/path9.jpg' },
  { id: 10, title: 'Movie 10', poster_path: '/path10.jpg' },
  { id: 11, title: 'Movie 11', poster_path: '/path11.jpg' },
  { id: 12, title: 'Movie 12', poster_path: '/path12.jpg' },
  { id: 13, title: 'Movie 13', poster_path: '/path13.jpg' },
  { id: 14, title: 'Movie 14', poster_path: '/path14.jpg' },
  { id: 15, title: 'Movie 15', poster_path: '/path15.jpg' },
  { id: 16, title: 'Movie 16', poster_path: '/path16.jpg' },
  { id: 17, title: 'Movie 17', poster_path: '/path17.jpg' },
  { id: 18, title: 'Movie 18', poster_path: '/path18.jpg' },
  { id: 19, title: 'Movie 19', poster_path: '/path19.jpg' },
  { id: 20, title: 'Movie 20', poster_path: '/path20.jpg' },
  { id: 21, title: 'Movie 21', poster_path: '/path21.jpg' },
  { id: 22, title: 'Movie 22', poster_path: '/path22.jpg' },
  { id: 23, title: 'Movie 23', poster_path: '/path23.jpg' },
  { id: 24, title: 'Movie 24', poster_path: '/path24.jpg' },
  { id: 25, title: 'Movie 25', poster_path: '/path25.jpg' },
  { id: 26, title: 'Movie 26', poster_path: '/path26.jpg' },
  { id: 27, title: 'Movie 27', poster_path: '/path27.jpg' },
  { id: 28, title: 'Movie 28', poster_path: '/path28.jpg' },
  { id: 29, title: 'Movie 29', poster_path: '/path29.jpg' },
  { id: 30, title: 'Movie 30', poster_path: '/path30.jpg' },
];

describe('MovieCollage Component', () => {
  beforeEach(() => {
    mock.onGet('https://api.themoviedb.org/3/trending/movie/week').reply(200, {
      results: mockMovies,
    });
  });

  afterEach(() => {
    mock.reset();
  });

  it('should render movie posters', async () => {
    render(<MovieCollage />);

    await waitFor(() => {
      mockMovies.slice(0, 30).forEach((movie) => {
        expect(screen.getByAltText(movie.title)).toBeInTheDocument();
      });
    });
  });

  it('should handle API error gracefully', async () => {
    mock.onGet('https://api.themoviedb.org/3/trending/movie/week').reply(500);

    render(<MovieCollage />);

    await waitFor(() => {
      expect(screen.queryByAltText('Movie 1')).not.toBeInTheDocument();
    });
  });
});