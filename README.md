# Matchmaking Backend API

A scalable matchmaking backend built with NestJS and MongoDB featuring personalized match recommendations, swipe-based interactions, mutual matching, and JWT-based authentication.

---

# Features

- JWT-based authentication with httpOnly cookie storage
- Personalized match recommendation engine
- Swipe interactions (Like / Pass)
- Mutual match detection
- Compatibility scoring algorithm
- MongoDB + Mongoose integration
- Modular NestJS architecture
- REST API architecture

---

# Tech Stack

- NestJS
- TypeScript
- MongoDB
- Mongoose
- Node.js
- JWT (JSON Web Tokens)

---

# Project Structure

```bash
src/
├── auth/          # JWT auth, guards, signup/login/logout
├── user/          # User schema, profile CRUD
├── matches/       # Matching algorithm, like/pass, mutual matches
├── common/        # Shared utilities and types
└── main.ts
```

---

# Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost/jhavtech
PORT=8000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key
NODE_ENV=local
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd jhavtech_assignment-backend
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run start:dev
```

---

# API Overview

## Authentication

| Method | Endpoint     | Description                     |
| ------ | ------------ | ------------------------------- |
| POST   | /auth/signup | Register and receive JWT cookie |
| POST   | /auth/signin | Login and receive JWT cookie    |
| POST   | /auth/logout | Clear JWT cookie                |
| GET    | /auth/me     | Get authenticated user profile  |

## Users

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | /user/profile | Get own profile |
| PUT    | /user/profile | Update profile  |

## Match System

| Method | Endpoint          | Description                      |
| ------ | ----------------- | -------------------------------- |
| GET    | /matches          | Get top 10 compatibility matches |
| POST   | /matches/:id/like | Like a profile                   |
| POST   | /matches/:id/pass | Pass on a profile                |
| GET    | /matches/mutual   | Get mutual matches               |

---

# Compatibility Scoring

Matches are ranked using a weighted algorithm:

| Factor           | Weight | Logic                                     |
| ---------------- | ------ | ----------------------------------------- |
| Shared Interests | 50%    | Jaccard similarity of interest arrays     |
| Same City        | 30%    | Exact city name match                     |
| Mutual Age Fit   | 20%    | Current user's age fits candidate's range |

---

# Database Schema

View the full schema diagram at:
https://dbdiagram.io/d/6a109c77dfb20dafcdd1dc5a

---

# API Documentation

Swagger UI available at:
http://localhost:8000/docs
