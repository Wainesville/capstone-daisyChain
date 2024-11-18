import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Register from './Register';
import { BrowserRouter as Router } from 'react-router-dom';
import { registerUser } from '../api';

jest.mock('../api');

const mock = new MockAdapter(axios);

describe('Register Component', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    mock.reset();
  });

  it('should render registration form', () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should display error message on registration failure', async () => {
    registerUser.mockRejectedValue(new Error('Registration failed'));

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'testuser@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('should call registerUser and navigate to login page on successful registration', async () => {
    const mockResponse = {
      user: { username: 'testuser', email: 'testuser@example.com' },
      token: 'fake-token',
    };
    registerUser.mockResolvedValue(mockResponse);

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'testuser@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password',
      });
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });
});