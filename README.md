# Matchmaking Backend API

A scalable matchmaking backend built with NestJS and MongoDB featuring personalized match recommendations, swipe-based interactions, mutual matching, and secure stateful session authentication using opaque tokens.

---

# Features

- Secure stateful session-based authentication
- Opaque token authentication with hashed session storage
- Personalized match recommendation engine
- Swipe interactions (Like / Pass)
- Mutual match detection
- Compatibility scoring algorithm
- Session tracking and revocation support
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
- SHA-256 Token Hashing

---

# Project Structure

```bash
src/
├── auth/
├── users/
├── match/
├── session/
├── common/
├── guards/
├── middleware/
├── schemas/
└── main.ts
```

---

# Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost/jhavtech
PORT=8000
CORS_ORIGIN=http://localhost:3000
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

| Method | Endpoint     | Description            |
| ------ | ------------ | ---------------------- |
| POST   | /auth/signup | Register new user      |
| POST   | /auth/login  | Login user             |
| POST   | /auth/logout | Logout user            |
| GET    | /auth/me     | Get authenticated user |

## Match System

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | /match/recommendations | Get top matches        |
| POST   | /match/action          | Like or pass a profile |
| GET    | /match/mutual          | Get mutual matches     |

---

# Database Diagram

The project database schema can be visualized using:

- dbdiagram.io (https://dbdiagram.io/d/6a109c77dfb20dafcdd1dc5a)
