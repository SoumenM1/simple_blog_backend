# Inkline Backend API

Node.js 20+, Express 4, MongoDB/Mongoose, JWT access + rotating refresh tokens, Google/Facebook OAuth 2.0, Zod validation, role-based authorization, soft deletion, activity logs, pagination, and Jest/Supertest tests.

## Setup

1. Install Node.js 20+ and MongoDB.
2. `npm install`
3. Copy `.env.example` to `.env`, then set a MongoDB URI and two different strong random JWT secrets (32+ characters). Configure OAuth credentials only if using those providers.
4. `npm run dev`
5. Set the React app's `VITE_API_URL=http://localhost:5000/api/v1` and Axios `withCredentials: true`.

## Important routes

- `POST /api/v1/auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me`
- OAuth starts: `GET /api/v1/auth/google`, `GET /api/v1/auth/facebook` (routes are enabled only when provider env credentials exist)
- Public posts: `GET /api/v1/posts`, `GET /api/v1/posts/:slug`
- Authenticated posts: `POST /api/v1/posts`, `GET /api/v1/posts/my-posts`, `PUT /api/v1/posts/:id`, `DELETE /api/v1/posts/:id`
- Comments: `GET /api/v1/posts/:postId/comments`, `POST /api/v1/posts/:postId/comments`, `PUT /api/v1/posts/comments/:id`, `DELETE /api/v1/posts/comments/:id`
- Admin only: `GET /api/v1/admin/dashboard`, `/users`, `/posts`, `/comments`, `/activities`; role/status management via `PATCH /api/v1/admin/users/:id/role` and `PATCH /api/v1/admin/posts/:id/status`; delete routes soft-delete where appropriate.

All successful responses use `{ success: true, data: ... }`; errors use `{ success: false, error: { message, details? } }`. Auth tokens are httpOnly cookies. Access tokens last 15 minutes by default; refresh tokens are stored as SHA-256 hashes in MongoDB, revoked during rotation/logout, and expire automatically. If the frontend uses cross-site deployment, set `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` and serve over HTTPS.

## Make first admin

Register normally, then in MongoDB update that user's `role` to `admin`. Never expose a public API that lets users assign themselves admin. Example in mongosh: `db.users.updateOne({email:"you@example.com"},{$set:{role:"admin"}})`.

## Test / validate

- `npm test`
- `npm run check`

The included tests are starter unit/integration tests. Add database-backed tests for auth refresh rotation, ownership/RBAC, comments and soft-delete behavior before production release. OAuth requires real provider credentials and callback URLs configured in each provider console. Production deployment should additionally use HTTPS, secret management, backups, monitoring, and a defined account deletion/data retention policy.
