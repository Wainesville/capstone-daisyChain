import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from './Login';
import { BrowserRouter as Router } from 'react-router-dom';
import { loginUser } from '../api';

jest.mock('../api');

const mock = new MockAdapter(axios);

describe('Login Component', () => {
  const handleLogin = jest.fn();

  beforeEach(() => {
    mock.reset();
  });

  it('should render login form', () => {
    render(
      <Router>
        <Login handleLogin={handleLogin} />
      </Router>
    );

    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should display error message on login failure', async () => {
    loginUser.mockRejectedValue(new Error('Login failed'));

    render(
      <Router>
        <Login handleLogin={handleLogin} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please check your credentials.')).toBeInTheDocument();
    });
  });

  it('should call handleLogin and navigate to user page on successful login', async () => {
    const mockResponse = {
      user: { username: 'testuser' },
      token: 'fake-token',
    };
    loginUser.mockResolvedValue(mockResponse);

    const navigate = jest.fn();
    render(
      <Router>
        <Login handleLogin={handleLogin} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith(mockResponse);
      expect(navigate).toHaveBeenCalledWith(`/user/${mockResponse.user.username}`);
    });
  });
});