# Inkline Backend API

REST API for **Inkline**, a MERN-based blogging platform. The backend uses Node.js, Express, MongoDB, and Mongoose, with JWT authentication, refresh-token rotation, OAuth login, role-based access control, post/comment management, and admin endpoints.

## Table of contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment configuration](#environment-configuration)
- [Run the API](#run-the-api)
- [API documentation overview](#api-documentation-overview)
- [Authentication and permissions](#authentication-and-permissions)
- [Data model overview](#data-model-overview)
- [Testing and validation](#testing-and-validation)
- [Create the first admin](#create-the-first-admin)
- [Troubleshooting](#troubleshooting)
- [Production checklist](#production-checklist)

## Features

- Registration, login, logout, and current-user endpoint.
- Short-lived JWT access tokens and rotating refresh tokens.
- Refresh tokens are stored as hashes in MongoDB and can be revoked.
- Password hashing with `bcryptjs`.
- Optional Google and Facebook OAuth 2.0 login through Passport.
- `admin` and `user` roles enforced on the API.
- Create, read, update, and soft-delete blog posts.
- URL-friendly post slugs.
- Comment CRUD with ownership checks and admin moderation.
- Admin dashboard counts for users, posts, and comments.
- User, post, comment, and activity-log administration endpoints.
- Zod request validation, centralized error handling, rate limiting, pagination, and database indexes.
- Starter Jest/Supertest tests and a source-check script.

## Technology stack

- Node.js 20+
- Express 4
- MongoDB and Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs`
- Passport, `passport-google-oauth20`, `passport-facebook`
- Zod validation
- `express-rate-limit`, Helmet, CORS, cookie-parser, Morgan
- Jest and Supertest

## Requirements

Install:

1. Node.js 20 or later and npm.
2. MongoDB locally or a MongoDB Atlas database.
3. Git (optional, for version control).

## Installation

From the backend project directory:

```bash
npm install
```

Create a local environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux**
```bash
cp .env.example .env
```

Edit `.env` and provide a valid MongoDB connection string and strong, unique JWT secrets. Do not commit `.env` to Git.

## Environment configuration

The `.env.example` file is the source of truth for supported variables. Typical local settings look like:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/inkline

JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30

COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback

OAUTH_SUCCESS_REDIRECT=http://localhost:5173/
OAUTH_FAILURE_REDIRECT=http://localhost:5173/login
```

Use the exact variable names shown in `.env.example`; remove example values that are not present there or adapt the configuration code before using them. For production, use a secrets manager, unique secrets, HTTPS, and secure cookie settings.

### Google/Facebook OAuth

OAuth routes are registered only when the corresponding provider credentials are configured. Create OAuth apps in the provider consoles and add the callback URLs configured in `.env`. OAuth cannot be fully tested without valid provider credentials.

## Run the API

Development mode with automatic restart:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

Health check:

```text
GET http://localhost:5000/api/v1/health
```

The default API prefix is `/api/v1`.

## API documentation overview

All endpoints below are relative to `/api/v1`.

### Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public, rate-limited | Create a user account |
| POST | `/auth/login` | Public, rate-limited | Sign in |
| POST | `/auth/refresh` | Refresh cookie | Rotate/refresh tokens |
| POST | `/auth/logout` | Refresh cookie/session | Revoke refresh token and log out |
| GET | `/auth/me` | Authenticated | Return current user |
| GET | `/auth/google` | OAuth configured | Start Google OAuth |
| GET | `/auth/facebook` | OAuth configured | Start Facebook OAuth |

### Posts

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/posts` | Public | List published posts with pagination |
| GET | `/posts/:slug` | Public | Fetch a published post by slug |
| GET | `/posts/my-posts` | Authenticated | List the current user's posts |
| POST | `/posts` | Authenticated | Create a post |
| PUT | `/posts/:id` | Owner or admin | Update a post |
| DELETE | `/posts/:id` | Owner or admin | Soft-delete a post |

### Comments

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/posts/:postId/comments` | Public | List comments for a post |
| POST | `/posts/:postId/comments` | Authenticated | Add a comment |
| PUT | `/posts/comments/:id` | Comment owner or admin | Edit a comment |
| DELETE | `/posts/comments/:id` | Comment owner or admin | Delete a comment |

### Admin

All `/admin/*` endpoints require authentication and the `admin` role.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Dashboard totals |
| GET | `/admin/users` | List/search users with pagination |
| PATCH | `/admin/users/:id/role` | Change a user's role |
| DELETE | `/admin/users/:id` | Remove a user |
| GET | `/admin/posts` | List/moderate posts |
| PATCH | `/admin/posts/:id/status` | Change post status |
| DELETE | `/admin/posts/:id` | Soft-delete a post |
| GET | `/admin/comments` | List comments for moderation |
| DELETE | `/admin/comments/:id` | Moderate/delete a comment |
| GET | `/admin/activities` | Read activity logs |

Check the route and controller files for exact accepted request fields and pagination query parameters.

### Response format

Successful responses use the general shape:

```json
{
  "success": true,
  "data": {}
}
```

Errors use the general shape:

```json
{
  "success": false,
  "error": {
    "message": "A readable error message"
  }
}
```

Validation errors may include additional details.

## Authentication and permissions

- Access tokens are short-lived; the default configured lifetime is 15 minutes.
- Refresh tokens are delivered using HttpOnly cookies and stored as hashes in MongoDB.
- Axios clients should set `withCredentials: true`.
- The browser JavaScript should not read the HttpOnly refresh cookie.
- API middleware validates authentication and enforces role/ownership rules. Hiding admin buttons in React is not a security boundary.
- For cross-site production deployments, use HTTPS and configure `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, and matching CORS origins.

## Data model overview

- **User:** profile/authentication details and role (`user` or `admin`).
- **Post:** title, content, author reference, slug, status, timestamps, and soft-delete fields.
- **Comment:** post and author references, content, timestamps, and deletion/moderation state.
- **RefreshToken:** hashed refresh-token records with expiry/revocation data.
- **ActivityLog:** recorded user/admin actions.

Mongoose schemas and indexes are defined under `src/models/`.

## Testing and validation

Run starter tests:

```bash
npm test
```

Run the source check:

```bash
npm run check
```

The included tests are starter coverage, not a guarantee of full requirement coverage. Before production, add database-backed integration tests for registration/login, refresh-token rotation and reuse, logout revocation, owner/admin authorization, comment CRUD, pagination, and soft-delete behavior.

## Create the first admin

1. Register through the normal registration endpoint.
2. In MongoDB, change that user's role to `admin`.
3. Sign in again so the frontend loads the updated user role.

Example in `mongosh` (replace the email):

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

Never allow public registration payloads to set their own role to `admin`.

## Troubleshooting

- **MongoDB connection failure:** verify that MongoDB is running and `MONGODB_URI` is correct.
- **CORS/cookie issue:** ensure `CLIENT_URL` exactly matches the frontend origin and Axios uses `withCredentials: true`.
- **401 after refresh:** check access/refresh cookie names, token secrets, cookie settings, and that frontend and backend use the same API base URL.
- **OAuth redirect failure:** verify client ID/secret and exact callback URLs in both `.env` and provider console.
- **Port already in use:** change `PORT` and update the frontend API URL.

## Production checklist

- Enable HTTPS and secure cookies.
- Store secrets outside source control.
- Configure allowed CORS origins narrowly.
- Test refresh-token rotation/revocation and authorization.
- Add database-backed tests and coverage reporting.
- Configure logging, monitoring, backups, and dependency/security updates.
- Review account deletion, privacy, and data-retention behavior.
