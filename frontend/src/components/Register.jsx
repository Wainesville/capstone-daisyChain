import React, { useState } from 'react';
import { registerUser } from '../api';
import './styles.css';
import MovieCollage from './MovieCollage';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ username, email, password });
      alert('Registration successful! You can log in now.');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <MovieCollage />
      <div className="form-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="form-control"
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
