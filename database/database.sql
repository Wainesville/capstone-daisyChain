-- Drop the existing database if it exists
DROP DATABASE IF EXISTS moviedb;

-- Create a new database
CREATE DATABASE moviedb;

-- Connect to the new database
\c moviedb;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    bio TEXT,
    profile_picture VARCHAR(255),
    profile_visibility BOOLEAN DEFAULT TRUE
);

-- Create the movies table
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    logo VARCHAR(255)
);

-- Create the reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    movie_id INTEGER NOT NULL REFERENCES movies(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recommendation BOOLEAN,
    movie_title VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    rating INTEGER,
    logo VARCHAR(255)
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the review_likes table
CREATE TABLE review_likes (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    user_id INTEGER NOT NULL REFERENCES users(id)
);

-- Create the watchlist table
CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    movie_id INTEGER NOT NULL REFERENCES movies(id),
    title VARCHAR(255) NOT NULL,
    poster VARCHAR(255),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
