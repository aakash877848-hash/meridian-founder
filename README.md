# Meridian — Founder & Startup Discovery Platform (V1)

A MERN-stack platform where founders maintain a startup profile and VC/admin
users search, filter, evaluate, shortlist, and connect with them.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios
- **Auth:** JWT access + refresh tokens in httpOnly cookies, bcrypt password hashing
- **File uploads:** Multer (local disk in V1; swap for S3/GCS in production)

## Project structure

```
vc-platform/
  backend/
    config/db.js              MongoDB connection
    models/                   User, StartupProfile, Note, Shortlist, Pipeline, ConnectionRequest
    middleware/                auth (JWT + RBAC), upload (multer), validate, errorHandler
    controllers/               authController, startupController, vcController, adminController
    routes/                    authRoutes, startupRoutes, vcRoutes, adminRoutes
    utils/                     tokens, AppError, catchAsync, seed.js
    server.js                  App entrypoint + security middleware
  frontend/
    src/
      api/axios.js             Axios instance with auto token-refresh
      context/AuthContext.jsx  Global session state
      components/               Navbar, ProtectedRoute, SearchFilters, StartupCard
      pages/                     Home, Login, Register, FounderProfileForm, FounderRequests,
                                  VCSearch, StartupDetail, VCShortlist, VCPipeline, AdminDashboard
```

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env        # fill in real secrets before deploying
npm install
npm run dev                 # nodemon, http://localhost:5000
```

Requires a running MongoDB instance (local or Atlas) — set `MONGO_URI` in `.env`.

Create the first admin account (admins cannot self-register via the public API):

```bash
node utils/seed.js admin@yourfirm.com "StrongPass123" "Admin Name"
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so
no CORS configuration is needed locally beyond what's already in `server.js`.

## Roles & access control

| Role      | Can do |
|-----------|--------|
| `founder` | Create/edit their own startup profile, upload documents, control visibility, view & respond to investor connection requests |
| `investor`| Search/filter published profiles, view sanitized founder contact info (unlocked after a connection is accepted), shortlist, add private notes, track deal pipeline, send connection requests |
| `admin`   | Everything investors can do, plus: view all profiles (including drafts), verify startups, force visibility, manage user accounts (activate/deactivate, create investor/admin accounts), view platform-wide stats |

Enforcement happens server-side via `protect` (JWT verification) and
`restrictTo(...roles)` middleware on every route — the frontend route guards
are a UX convenience, not the security boundary.

## Data model notes (why it's built this way)

- **StartupProfile** is deliberately one document per founder with compound +
  text indexes (`sector`, `stage`, `location.country`, fundraising ask,
  revenue, full-text search) so the search/filter endpoint stays fast as the
  dataset grows, without needing a separate search service for V1.
- **Notes** are scoped to the startup and carry an `author`, so any investor
  teammate can read team notes by default, with an optional
  `isPrivateToAuthor` flag for personal scratch notes — this models a real
  investment team's workflow without over-engineering permissions in V1.
- **Pipeline** is keyed by `(owner, startup)`, not just `startup`, so two
  different investor accounts (or firms, once multi-tenancy is added) can
  independently track the same company through their own deal stages.
- **ConnectionRequest** exists as its own collection rather than a boolean
  flag so it can grow into real threaded messaging later without a schema
  migration, and so founder contact info can be gated behind an accepted
  request (a lightweight privacy control called out in the brief).

## Built for the roadmap

The schema and API already leave room for the features you listed as "later":

- **Investor profiles & thesis:** add an `InvestorProfile` model
  (thesis, check size, sectors of interest) linked 1:1 to `User` the same way
  `StartupProfile` is — no changes needed to existing models.
- **Matching score:** `StartupProfile.matchScores[]` already stores a
  per-investor score placeholder; a scoring job can populate it and the
  search endpoint can sort/filter on it.
- **AI natural-language search:** the `/api/startups/search` controller is
  isolated behind `buildFilterQuery()` — swap in an LLM step that translates
  a free-text query into the same filter object, or add a vector index
  alongside the existing Mongo text index.
- **Warm intro / relationship mapping:** model as a graph collection
  (`Connection { userA, userB, strength, source }`) — `ConnectionRequest` is
  already a natural first edge type to seed it with.
- **Verification:** `StartupProfile.verification` and the admin
  `verify`/visibility endpoints are already in place; extend with document
  checks or a third-party KYB provider later.
- **Analytics:** `adminController.platformStats` is a starting aggregation
  endpoint; add time-series collections or a dedicated analytics DB once
  volume justifies it.

## Security measures included

- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens (short-lived) + refresh tokens, both httpOnly, sameSite,
  and `secure` in production
- Account lockout after repeated failed logins
- `helmet`, `cors` (credentialed, origin-locked), `express-mongo-sanitize`,
  `hpp`, and rate limiting (stricter on auth routes)
- Centralized error handler that never leaks stack traces in production
- Server-side file-type and size validation on uploads
- Field-level allow-listing on every write endpoint (no mass-assignment)

## Known V1 trade-offs to revisit before scaling further

- File storage is local disk — move to S3/GCS + signed URLs before real
  production traffic or multi-instance deployment.
- No email delivery is wired up yet (connection requests are stored, not
  emailed) — add a transactional email provider (SES, Postmark, Resend).
- One `StartupProfile` per founder — fine for V1; if a startup will ever
  need multiple founder-editors, add a `collaborators[]` array of user IDs.
- No automated test suite yet — recommend adding integration tests around
  auth, RBAC boundaries, and the search filter builder first, since those
  are the highest-risk areas for regressions.
