import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import EditProfile from './EditProfile';
import { BrowserRouter as Router } from 'react-router-dom';

const mock = new MockAdapter(axios);

const mockProfileData = {
  profile_picture: 'http://example.com/profile.jpg',
  bio: 'This is a bio',
  favorite_genres: ['Action', 'Comedy'],
  top_movies: [1, 2, 3, 4, 5],
};

const mockMoviesData = [
  { id: 1, title: 'Movie 1', poster_path: '/path1.jpg' },
  { id: 2, title: 'Movie 2', poster_path: '/path2.jpg' },
  { id: 3, title: 'Movie 3', poster_path: '/path3.jpg' },
  { id: 4, title: 'Movie 4', poster_path: '/path4.jpg' },
  { id: 5, title: 'Movie 5', poster_path: '/path5.jpg' },
];

describe('EditProfile Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    mock.onGet('http://localhost:5000/api/users/profile').reply(200, mockProfileData);
    mockMoviesData.forEach((movie) => {
      mock.onGet(`http://localhost:5000/api/movies/${movie.id}`).reply(200, movie);
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  afterEach(() => {
    mock.reset();
    localStorage.removeItem('token');
    jest.resetAllMocks();
  });

  it('should render profile data', async () => {
    render(
      <Router>
        <EditProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('This is a bio')).toBeInTheDocument();
    });

    expect(screen.getByAltText('Profile Picture')).toHaveAttribute('src', 'mock-url');
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Comedy')).toBeInTheDocument();
    mockMoviesData.forEach((movie) => {
      expect(screen.getByText(movie.title)).toBeInTheDocument();
    });
  });

  it('should handle profile update', async () => {
    render(
      <Router>
        <EditProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('This is a bio')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'Updated bio' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
    });
  });

  it('should handle profile picture change', async () => {
    render(
      <Router>
        <EditProfile />
      </Router>
    );

    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const input = screen.getByLabelText('Profile Picture');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Profile Picture')).toHaveAttribute('src', 'mock-url');
    });
  });

  it('should handle favorite genres change', async () => {
    render(
      <Router>
        <EditProfile />
      </Router>
    );

    const checkbox = screen.getByLabelText('Drama');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('should handle top movies search and selection', async () => {
    render(
      <Router>
        <EditProfile />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for movie 1');
    fireEvent.change(searchInput, { target: { value: 'Movie 1' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('1. Movie 1')).toBeInTheDocument();
    });
  });

  it('should handle removing a top movie', async () => {
    render(
      <Router>
        <EditProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('1. Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.queryByText('1. Movie 1')).not.toBeInTheDocument();
    });
  });

  it('should display an error message if profile data fetch fails', async () => {
    mock.onGet('http://localhost:5000/api/users/profile').reply(500);

    render(
      <Router>
        <EditProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch profile data')).toBeInTheDocument();
    });
  });

  it('should display an error message if movie search fails', async () => {
    mock.onGet('https://api.themoviedb.org/3/search/movie').reply(500);

    render(
      <Router>
        <EditProfile />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText('Search for movie 1');
    fireEvent.change(searchInput, { target: { value: 'Movie 1' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Failed to search movies')).toBeInTheDocument();
    });
  });

  it('should handle form submission with valid data', async () => {
    mock.onPut('http://localhost:5000/api/users/profile').reply(200);

    render(
      <Router>
        <EditProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('This is a bio')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'Updated bio' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('should handle form submission with invalid data', async () => {
    mock.onPut('http://localhost:5000/api/users/profile').reply(400);

    render(
      <Router>
        <EditProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('This is a bio')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'Updated bio' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
    });
  });
});