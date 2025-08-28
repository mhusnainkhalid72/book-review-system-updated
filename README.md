
# Book Review System

## Overview

The **Book Review System** is a modern full-stack application designed to provide a platform for users to add, manage, and view book reviews. Built with **Node.js**, **Express**, **MongoDB**, and **Redis** for caching, this system is optimized for performance and scalability. It also includes **JWT authentication** for secure access and a Dockerized environment for easy deployment across various environments (development, production).

## Features

- **User Authentication**: Secure login and registration via JWT tokens.
- **Book Reviews**: Add, update, and delete reviews for books.
- **Caching**: Redis caching to improve response times for frequently accessed data.
- **API Endpoints**:
  - `POST /api/auth/register` - Register a new user.
  - `POST /api/auth/login` - Log in to obtain JWT token.
  - `GET /api/books` - Get a list of books.
  - `POST /api/reviews` - Submit a review for a book.
  - `GET /api/reviews/:bookId` - Get reviews for a specific book.

## Tech Stack

- **Backend**: 
  - Node.js with Express.js
  - TypeScript for type safety
  - MongoDB for database storage
  - Redis for caching frequently used data
- **Containerization**: 
  - Docker & Docker Compose for building and running the app in isolated containers.



### Dockerized Setup

- docker-compose build
- docker-compose up -d


## Development Setup (Without Docker) 
 

 ## Run locally
 - npm install
 -npm run dev 


## Production Setup
- npm run build 
- npm run start 