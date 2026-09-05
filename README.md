# Flowmetrics

**A fictional team productivity & analytics SaaS platform — built as a full-stack internship challenge submission.**

> "See where your team's time and effort actually go."

---

## 1. Project Overview

Flowmetrics is a production-style SaaS website with:

- A polished public landing page (Hero, Features, Pricing, Testimonials, Blog, Footer)
- Individual blog post detail pages with safe Markdown rendering
- A secure admin CMS for managing Pricing Plans and Blog Posts
- Draft/Published state management (drafts never returned to public APIs)
- Full CRUD with validation, rate limiting, JWT authentication, and role-based authorization
- MongoDB persistence via Atlas

---

## 2. Features

| Feature | Detail |
|---|---|
| Landing page | 6 sections: Hero, Features, Pricing, Testimonials, Blog, Footer |
| Dynamic Pricing | Fetched from backend, highlighted plan styled distinctly |
| Dynamic Blog | Featured posts first, slug-routed detail pages |
| Blog Markdown editor | `@uiw/react-md-editor` in admin panel |
| Safe Markdown rendering | `react-markdown` + URL scheme validation (no XSS) |
| Draft protection | `published: false` posts hidden at DB query level, never frontend-only |
| Admin login | JWT authentication, rate-limited, generic error messages |
| Admin dashboard | Stats cards + quick links |
| Admin pricing CRUD | Create, edit, delete, highlighted/published toggles |
| Admin blog CRUD | Create, edit, delete, featured/draft/published toggles |
| Role-based authorization | `authenticate` → `requireAdmin` middleware chain |
| Zod validation | Every write endpoint validated with typed schemas |
| Rate limiting | Login: 10/15min · Write endpoints: 60/15min |
| Security headers | Helmet, CORS allowlist, CSP |
| Mass assignment protection | Explicit field whitelisting in every controller |
| ObjectId validation | Before every DB query by ID |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Markdown editor | `@uiw/react-md-editor` (admin only) |
| Markdown renderer | `react-markdown` + URL validation |
| Typography | `@tailwindcss/typography` |
| Backend | Node.js 22, Express 5, TypeScript |
| Runtime TypeScript | `tsx` (Node 22 compatible) |
| Database | MongoDB Atlas via Mongoose 8 |
| Authentication | JWT (`jsonwebtoken`), `bcryptjs` |
| Validation | Zod 3 |
| Security | Helmet 7, `cors`, `express-rate-limit` |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 4. Architecture

```
Browser
  │ HTTPS
  ▼
Vercel (Next.js)
  │ fetch() with Bearer token
  ▼
Render (Express/Node.js)
  ├─ Rate Limiting     (express-rate-limit)
  ├─ CORS             (explicit allowlist)
  ├─ Security Headers  (Helmet)
  ├─ Authentication    (JWT verification)
  ├─ Authorization     (role === 'admin')
  ├─ Zod Validation
  └─ Business Logic
       │
       ▼
  MongoDB Atlas
```

Server components fetch data server-side on the public landing page (SSR). Client components are used only where browser interaction is required (admin forms, editor, auth).

---

## 5. Folder Structure

```
flowmetrics/
├── README.md
├── SECURITY.md
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          Root layout + Google Fonts + metadata
│   │   ├── page.tsx            Landing page (SSR, live API fetch)
│   │   ├── blog/[slug]/        Blog detail (SSR, dynamic metadata)
│   │   └── admin/
│   │       ├── layout.tsx      AuthProvider wrapper
│   │       ├── login/          Admin login form
│   │       ├── page.tsx        Dashboard stats
│   │       ├── pricing/        Pricing CRUD
│   │       └── blog/           Blog list + new/[id] edit
│   ├── components/
│   │   ├── landing/            Hero, Features, Pricing, Testimonials, Blog, Navbar, Footer
│   │   ├── blog/               MarkdownRenderer (sanitized)
│   │   ├── admin/              AdminSidebar, AdminShell, BlogForm
│   │   └── ui/                 Button, Sparkline
│   ├── lib/
│   │   ├── api.ts              fetch() wrapper with typed responses
│   │   ├── auth.tsx            JWT auth context (localStorage)
│   │   ├── format.ts           Date formatter
│   │   └── staticContent.ts    Features, testimonials (static)
│   └── types/index.ts          Shared TypeScript interfaces
│
└── backend/
    └── src/
        ├── config/             db.ts, env.ts
        ├── controllers/        auth, pricing, blog, admin
        ├── middleware/         auth.ts, errorHandler.ts, rateLimiters.ts, validate.ts
        ├── models/             User, PricingPlan, BlogPost
        ├── routes/             auth, pricing, blog, admin
        ├── validators/         Zod schemas
        ├── utils/              AppError, asyncHandler, jwt
        ├── seed/               seed.ts
        ├── app.ts
        └── server.ts
```

---

## 6. Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/flowmetrics?retryWrites=true&w=majority
JWT_SECRET=<minimum-32-character-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Never commit `.env` or `.env.local`. Both `.env.example` files are committed for reference.

---

## 7. Local Setup

### Prerequisites

- Node.js 20+ (v22 recommended)
- npm
- A MongoDB Atlas account (free M0 tier is sufficient)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/flowmetrics.git
cd flowmetrics

# 2. Install backend dependencies
cd backend
npm install

# 3. Create backend .env
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Create frontend .env.local
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000 (default, no change needed for local)
```

### Running locally

```bash
# Terminal 1 — backend
cd backend
npm run dev     # tsx watch (hot-reload)

# Terminal 2 — frontend
cd frontend
npm run dev     # Next.js dev server on http://localhost:3000
```

---

## 8. MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free account
2. Create a **Free M0 cluster** (region doesn't matter for development)
3. **Database Access** → Add database user with `readWriteAnyDatabase` role → note username/password
4. **Network Access** → Add IP address:
   - For local dev: your current IP or `0.0.0.0/0` (allow all, fine for dev)
   - For production: Render's static IPs (or `0.0.0.0/0` if Render doesn't offer static IPs on free tier)
5. **Connect** → Connect your application → Copy the connection string
6. Replace `<password>` with your DB user password and add `/flowmetrics` as the database name:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/flowmetrics?retryWrites=true&w=majority
   ```
7. Paste into `backend/.env` as `MONGODB_URI`

---

## 9. Seed Instructions & Demo Accounts

The seed script creates all demo accounts and initial content for testing:

### 🔑 Demo Accounts Credentials

| Role | Name | Email / Username | Password | Workspace & Capabilities |
|---|---|---|---|---|
| **Admin** | Flowmetrics Admin | `admin@flowmetrics.dev` | `ChangeMe123!` | Admin CMS (`/admin`), Pricing Plans CRUD, Blog Posts CRUD, Team Analytics (`/admin/team`) |
| **Employee** | Alex Rivera | `alex@flowmetrics.dev` | `Employee123!` | Employee Progress Workspace (`/employee`), Work Activity Logging |
| **Employee** | Priya Nair | `priya@flowmetrics.dev` | `Employee123!` | Employee Progress Workspace (`/employee`), Work Activity Logging |
| **Employee** | Marcus Chen | `marcus@flowmetrics.dev` | `Employee123!` | Employee Progress Workspace (`/employee`), Work Activity Logging |

### Seed Data Generated
- **3 Pricing Plans**: Starter ($0), Team ($19 ★ Highlighted), Business ($49)
- **6 Blog Posts**: 5 published articles + 1 draft post (to verify draft protection security boundary)
- **7 Work Activity Logs**: Seeded work logs across projects (*Mobile App Redesign*, *API Infrastructure*, *Customer Portal*)

To seed or reset the database:

```bash
cd backend
npm run seed
```

> ⚠️ **The seed passwords are for local development & demonstration only.** Change them before deploying to production.

---

## 10. API Documentation

### Public Endpoints (no auth required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Admin login (rate-limited: 10/15min) |
| GET | `/api/pricing` | Published plans (sorted by displayOrder) |
| GET | `/api/blog` | Published posts (featured first) |
| GET | `/api/blog/slug/:slug` | Single published post by slug |

### Admin Endpoints (Bearer token + admin role required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard counts |
| GET | `/api/admin/pricing` | All plans (incl. unpublished) |
| POST | `/api/admin/pricing` | Create plan |
| PUT | `/api/admin/pricing/:id` | Update plan |
| DELETE | `/api/admin/pricing/:id` | Delete plan |
| GET | `/api/admin/blog` | All posts (incl. drafts) |
| GET | `/api/admin/blog/:id` | Single post by ID |
| POST | `/api/admin/blog` | Create post |
| PUT | `/api/admin/blog/:id` | Update post |
| DELETE | `/api/admin/blog/:id` | Delete post |

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email",
    "price": "Price cannot be negative"
  }
}
```

---

## 11. Authentication

1. `POST /api/auth/login` with `{ email, password }`
2. Server validates with Zod, finds user by email (explicit field, not `req.body`)
3. `bcryptjs.compare()` verifies password against hash (saltRounds=12 in seed, 10 in seeded data)
4. JWT signed with HS256 algorithm, 7-day expiry, secret from env
5. Frontend stores token in localStorage, sends as `Authorization: Bearer <token>`
6. Every admin route runs `authenticate` (verify JWT) → `requireAdmin` (check `role === 'admin'`)

---

## 12. Validation

All write endpoints use Zod schemas. Example: creating a blog post requires:
- `title`: string, 3–150 chars
- `slug`: lowercase alphanumeric + hyphens, 3–150 chars
- `excerpt`: string, 10–300 chars
- `content`: string, min 20 chars
- `coverImage`: valid `http://` or `https://` URL
- `author`: string, 2–80 chars
- `featured`, `published`: booleans (optional, default false)

---

## 13. Rate Limiting

| Endpoint | Window | Limit | Rationale |
|---|---|---|---|
| `POST /api/auth/login` | 15 min | 10 requests | Prevents brute-force login |
| Admin write endpoints | 15 min | 60 requests | Prevents abuse while not blocking normal admin use |

Returns HTTP `429` when limit exceeded.

---

## 14. Public vs. Admin Access

| Resource | Public | Admin |
|---|---|---|
| Pricing (published) | ✅ GET | ✅ GET |
| Pricing (unpublished) | ❌ never | ✅ GET, POST, PUT, DELETE |
| Blog (published) | ✅ GET | ✅ GET |
| Blog (draft) | ❌ 404 (not "access denied") | ✅ GET, POST, PUT, DELETE |

Draft protection is enforced **at the database query layer**:
```ts
// Public: always enforced
BlogPost.find({ published: true })

// Admin: no filter
BlogPost.find()
```

---

## 15. Security Architecture

```
Browser
  │ HTTPS
  ▼
Vercel / Next.js
  │ API requests
  ▼
Render / Express
  ├─ Rate Limiting       (express-rate-limit)
  ├─ CORS                (explicit allowlist, not *)
  ├─ Security Headers    (Helmet)
  ├─ Authentication      (JWT verify, HS256)
  ├─ Authorization       (role === 'admin')
  ├─ Zod Validation      (every write endpoint)
  └─ Business Logic
       │ explicit field extraction (no mass assignment)
       │ ObjectId validation before queries
       ▼
  MongoDB Atlas
```

See [SECURITY.md](./SECURITY.md) for full threat model and security documentation.

---

## 16. Deployment Instructions

### MongoDB Atlas
Already covered in §8.

### Render (Backend)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub → select `flowmetrics` repo
4. **Root directory**: `backend`
5. **Build command**: `npm install && npm run build`
6. **Start command**: `npm start`
7. **Environment variables** (add in Render dashboard):
   ```
   PORT=5000
   MONGODB_URI=<your Atlas URI>
   JWT_SECRET=<your secret>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://<your-vercel-app>.vercel.app
   NODE_ENV=production
   ```
8. Deploy → note the URL (e.g. `https://flowmetrics-api.onrender.com`)

### Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub → select `flowmetrics` repo
3. **Root directory**: `frontend`
4. Framework preset: Next.js (auto-detected)
5. **Environment variable**:
   ```
   NEXT_PUBLIC_API_URL=https://flowmetrics-api.onrender.com
   ```
6. Deploy → note the URL

### CORS Update

After Vercel deployment, update `FRONTEND_URL` in Render's environment variables to your Vercel URL and redeploy the backend.

---

## 17. Known Limitations

- **Render free tier cold starts**: First request after inactivity may take 30–60s. This is a free-tier limitation.
- **JWT in localStorage**: Simpler approach; XSS risk mitigated by Markdown sanitization and strict rendering. Production would use HttpOnly cookies.
- **No image uploads**: Cover images are URL-only. Avoids file upload attack surface.
- **No public registration**: Admin accounts are created via seed script only.
- **No email verification**: Admin password reset requires direct DB access.

---

## 18. Future Improvements

- HttpOnly cookie authentication + CSRF tokens
- Image upload with presigned S3 URLs (or Cloudinary)
- Email notifications (magic link password reset)
- Role granularity (editor role with limited access)
- Full-text search on blog posts
- ISR (Incremental Static Regeneration) for blog pages
- Automated test suite (Jest / Playwright)
- Admin activity audit log

---

## 19. Security Review Date

Last `npm audit` run: **2026-09-05**
- Frontend: `found 0 vulnerabilities` (after Next.js upgrade)
- Backend: `found 0 vulnerabilities` (after Express upgrade)
