import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  fetchGenres,
  fetchMovieInfo,
  fetchMovieReviews,
  fetchWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  fetchMovieVideos,
  fetchMovieImages,
  fetchTrendingMovies,
  fetchUpcomingMovies,
  fetchMoviesByGenre,
  searchMovies,
  loginUser,
  registerUser,
  fetchUserData,
  fetchWatchlistByUserId,
  fetchUserReviews,
  fetchRecommendations,
  fetchAllReviews,
} from './api';

const mock = new MockAdapter(axios);
const API_SERVER_URL = 'http://localhost:5000/api';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '8feb4db25b7185d740785fc6b6f0e850';

describe('API functions', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should fetch genres', async () => {
    const mockGenres = { genres: [{ id: 1, name: 'Action' }] };
    mock.onGet(`${BASE_URL}/genre/movie/list`).reply(200, mockGenres);

    const genres = await fetchGenres();
    expect(genres).toEqual(mockGenres.genres);
  });

  it('should fetch movie info', async () => {
    const mockMovieInfo = { id: 1, title: 'Test Movie' };
    mock.onGet(`${BASE_URL}/movie/1`).reply(200, mockMovieInfo);

    const movieInfo = await fetchMovieInfo(1);
    expect(movieInfo).toEqual(mockMovieInfo);
  });

  it('should fetch movie reviews', async () => {
    const mockReviews = [{ id: 1, content: 'Great movie!' }];
    mock.onGet(`${API_SERVER_URL}/reviews/movie/1`).reply(200, mockReviews);

    const reviews = await fetchMovieReviews(1);
    expect(reviews).toEqual(mockReviews);
  });

  it('should fetch watchlist', async () => {
    const mockWatchlist = [{ movie_id: 1, title: 'Test Movie' }];
    localStorage.setItem('token', 'fake-token');
    mock.onGet(`${API_SERVER_URL}/watchlist`).reply(200, mockWatchlist);

    const watchlist = await fetchWatchlist();
    expect(watchlist).toEqual(mockWatchlist);
  });

  it('should add to watchlist', async () => {
    localStorage.setItem('token', 'fake-token');
    mock.onPost(`${API_SERVER_URL}/watchlist/add`).reply(200);

    const result = await addToWatchlist(1, 'Test Movie', '/path.jpg');
    expect(result).toBe(true);
  });

  it('should remove from watchlist', async () => {
    localStorage.setItem('token', 'fake-token');
    mock.onDelete(`${API_SERVER_URL}/watchlist/remove/1`).reply(200);

    await removeFromWatchlist(1);
    expect(mock.history.delete.length).toBe(1);
  });

  it('should fetch movie videos', async () => {
    const mockVideos = { results: [{ id: 1, key: 'test-key' }] };
    mock.onGet(`${BASE_URL}/movie/1/videos`).reply(200, mockVideos);

    const videos = await fetchMovieVideos(1);
    expect(videos).toEqual(mockVideos.results);
  });

  it('should fetch movie images', async () => {
    const mockImages = { backdrops: [{ file_path: '/path.jpg' }] };
    mock.onGet(`${BASE_URL}/movie/1/images`).reply(200, mockImages);

    const images = await fetchMovieImages(1);
    expect(images).toEqual(mockImages);
  });

  it('should fetch trending movies', async () => {
    const mockMovies = { results: [{ id: 1, title: 'Test Movie' }] };
    mock.onGet(`${BASE_URL}/trending/movie/day`).reply(200, mockMovies);

    const movies = await fetchTrendingMovies();
    expect(movies).toEqual(mockMovies.results);
  });

  it('should fetch upcoming movies', async () => {
    const mockMovies = { results: [{ id: 1, title: 'Test Movie' }] };
    mock.onGet(`${BASE_URL}/movie/upcoming`).reply(200, mockMovies);

    const movies = await fetchUpcomingMovies();
    expect(movies).toEqual(mockMovies.results);
  });

  it('should fetch movies by genre', async () => {
    const mockMovies = { results: [{ id: 1, title: 'Test Movie' }] };
    mock.onGet(`${BASE_URL}/discover/movie`).reply(200, mockMovies);

    const movies = await fetchMoviesByGenre(1);
    expect(movies).toEqual(mockMovies.results);
  });

  it('should search movies', async () => {
    const mockMovies = { results: [{ id: 1, title: 'Test Movie' }] };
    mock.onGet(`${BASE_URL}/search/movie`).reply(200, mockMovies);

    const movies = await searchMovies('Test');
    expect(movies).toEqual(mockMovies.results);
  });

  it('should login user', async () => {
    const mockResponse = { token: 'fake-token', user: { username: 'testuser' } };
    mock.onPost(`${API_SERVER_URL}/auth/login`).reply(200, mockResponse);

    const response = await loginUser({ username: 'testuser', password: 'password' });
    expect(response).toEqual(mockResponse);
  });

  it('should register user', async () => {
    const mockResponse = { user: { username: 'testuser' } };
    mock.onPost(`${API_SERVER_URL}/auth/register`).reply(200, mockResponse);

    const response = await registerUser({ username: 'testuser', email: 'test@example.com', password: 'password' });
    expect(response).toEqual(mockResponse);
  });

  it('should fetch user data', async () => {
    const mockUserData = { username: 'testuser' };
    localStorage.setItem('token', 'fake-token');
    mock.onGet(`${API_SERVER_URL}/users/testuser`).reply(200, mockUserData);

    const userData = await fetchUserData('testuser');
    expect(userData).toEqual(mockUserData);
  });

  it('should fetch watchlist by user ID', async () => {
    const mockWatchlist = [{ movie_id: 1, title: 'Test Movie' }];
    mock.onGet(`${API_SERVER_URL}/watchlist/1`).reply(200, mockWatchlist);

    const watchlist = await fetchWatchlistByUserId(1);
    expect(watchlist).toEqual(mockWatchlist);
  });

  it('should fetch user reviews', async () => {
    const mockReviews = [{ id: 1, content: 'Great movie!' }];
    localStorage.setItem('token', 'fake-token');
    mock.onGet(`${API_SERVER_URL}/reviews/user/1`).reply(200, mockReviews);

    const reviews = await fetchUserReviews(1);
    expect(reviews).toEqual(mockReviews);
  });

  it('should fetch recommendations', async () => {
    const mockRecommendations = [{ id: 1, title: 'Test Movie' }];
    localStorage.setItem('token', 'fake-token');
    mock.onGet(`${API_SERVER_URL}/recommendations`).reply(200, mockRecommendations);

    const recommendations = await fetchRecommendations();
    expect(recommendations).toEqual(mockRecommendations);
  });

  it('should fetch all reviews', async () => {
    const mockReviews = [{ id: 1, content: 'Great movie!' }];
    localStorage.setItem('token', 'fake-token');
    mock.onGet(`${API_SERVER_URL}/reviews`).reply(200, mockReviews);

    const reviews = await fetchAllReviews();
    expect(reviews).toEqual(mockReviews);
  });
});