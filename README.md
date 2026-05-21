Auth
POST /auth/signup Register a new user
POST /auth/login Login and receive JWT token

Users
GET /users/profile Get current user profile
PUT /users/profile Update profile and preferences

Matches
GET /matches Get top 10 matches
POST /matches/:id/like Like a profile
POST /matches/:id/pass Pass on a profile
GET /matches/mutual Get mutual matches
