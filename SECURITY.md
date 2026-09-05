# SECURITY.md — Flowmetrics Security Documentation

This document describes the security controls implemented in Flowmetrics, the threats they address, their limitations, and remaining risks. It does **not** claim the application is vulnerability-free.

---

## 1. Security Philosophy

> "Security is enforced at the server boundary, not assumed from the frontend."

Every security-sensitive decision (authentication, authorization, draft visibility, input validation) is made server-side. The frontend is treated as an untrusted client. Frontend checks (admin route guards, UI hiding of drafts) exist for UX only — they are not relied upon as security controls.

---

## 2. Threat Model

| Asset | Threat | Control |
|---|---|---|
| Admin credentials | Brute-force login | Rate limiting (10/15min), bcrypt hashing |
| Admin credentials | Credential stuffing | Same rate limit; generic error messages |
| JWT | Token theft via XSS | Markdown sanitization; no unsafe eval/innerHTML |
| JWT | Algorithm confusion | HS256 explicitly specified in both sign and verify |
| Admin API | Unauthorized access | `authenticate` → `requireAdmin` chain |
| Admin API | Privilege escalation via role in body | `role` never accepted from request body |
| Blog content | Stored XSS | `react-markdown` with URL validation; no raw HTML injection |
| Blog content | Markdown injection | URL scheme validation in link/img overrides |
| MongoDB | Operator injection | Zod rejects non-string inputs; explicit field extraction |
| MongoDB | Mass assignment | Whitelisted fields only in create/update controllers |
| MongoDB | Malformed ObjectId crash | `mongoose.isValidObjectId()` before DB query |
| API | Large request DoS | `express.json({ limit: '1mb' })` |
| API | Parameter pollution | Zod validates all inputs; no arbitrary query passthrough |
| API | Information disclosure | No stack traces in production responses |
| Dependencies | Known CVEs | `npm audit` reviewed; Express and Next.js upgraded |
| Secrets | Committed credentials | `.env` in `.gitignore`; `.env.example` provided |
| CORS | Arbitrary origin access | Explicit allowlist: `FRONTEND_URL` only |
| Images | SSRF via URL fetch | Server never fetches user-provided URLs; URLs are stored only |
| File uploads | Malicious uploads | File uploads not implemented; URLs only |

---

## 3. Authentication

**Implementation:** `POST /api/auth/login`

1. Zod validates `email` (must be valid email format) and `password` (min 8 chars). This rejects non-string inputs that could become MongoDB operators.
2. `User.findOne({ email })` — exact string field, not `req.body` passthrough.
3. `bcryptjs.compare(password, user.passwordHash)` — constant-time comparison.
4. Same generic error `"Invalid email or password"` for both non-existent users and wrong passwords. Prevents **account enumeration**.
5. JWT signed with `HS256`, `sub` = user ID, `role` = user role, expiry from env.
6. Response includes `token` and safe user object (`id`, `name`, `email`, `role`). **Never includes `passwordHash`.**

**Rate limiting:** 10 requests per 15 minutes per IP.

**Limitations:** No multi-factor authentication. No account lockout (rate limiting is the defense). No refresh tokens — token expiry requires re-login.

---

## 4. Authorization

**Middleware chain for every admin route:**

```
Request → authenticate (verify JWT signature + expiry)
        → requireAdmin (check req.user.role === 'admin')
        → validate (Zod schema)
        → controller (explicit field extraction)
```

`req.user.role` comes from the verified JWT payload, not from the request body. The client cannot set its own role.

**What is explicitly NOT a security control:**
- Frontend route guards (`AdminShell`) — client-side only, for UX
- Hiding admin links in the navbar — UI only
- "If token exists, allow access" — role is always checked

---

## 5. XSS Defenses

### Stored XSS

Blog content is written by authenticated admins using a Markdown editor. Despite admin authentication, we treat stored content as potentially untrusted:

1. The admin account could be compromised.
2. Content written before a security fix may contain payloads.

**Defense:** `react-markdown` converts Markdown to React elements (virtual DOM nodes). It does **not** use `dangerouslySetInnerHTML`. Raw HTML in Markdown is rendered as escaped text (rehype-raw plugin is NOT enabled).

### URL-based XSS (links and images)

Custom `components` overrides in `MarkdownRenderer.tsx` check URL schemes:

```ts
function isSafeUrl(url) {
  const parsed = new URL(url, 'https://base.invalid');
  return parsed.protocol === 'https:' || parsed.protocol === 'http:';
}
```

- `javascript:` URLs → rendered as plain text
- `data:` URLs in links → rendered as plain text
- `data:` URLs in images → element not rendered
- `onerror`, `onclick` etc. → never rendered (react-markdown does not pass event attributes)

### Reflected and DOM XSS

- Next.js escapes all JSX expressions by default.
- No `eval()`, no `Function()`, no `document.write()`.
- No untrusted data injected into `<script>` blocks.
- `dangerouslySetInnerHTML` is **not used anywhere** in the application.

### XSS Test Cases

These payloads should render harmlessly:

| Payload | Expected result |
|---|---|
| `<script>alert('XSS')</script>` | Displayed as escaped text |
| `<img src=x onerror=alert('XSS')>` | Rendered as plain text (no img tag) |
| `[click](javascript:alert('XSS'))` | Rendered as span with "click" text, no link |
| `[click](javascript:void(0))` | Rendered as span with "click" text |

---

## 6. Markdown Security

The admin Markdown editor (`@uiw/react-md-editor`) is used **only in the admin panel** (behind authentication). The preview inside the editor uses react-markdown internally.

The **public blog detail page** uses our custom `MarkdownRenderer` component with URL validation.

**No Markdown is eval'd, executed, or injected as raw HTML.**

---

## 7. NoSQL / MongoDB Injection Defense

MongoDB does not use SQL, but it has its own operator injection risk. Example attack:

```json
POST /api/auth/login
{"email": {"$gt": ""}, "password": "anything"}
```

Without Zod, this would query `User.findOne({ email: { $gt: "" } })` — matching any user.

**Our defense:** Zod schema requires `email` to be `z.string().email()`. A non-string value (like an object) fails type validation before reaching the database. Controllers extract fields explicitly:

```ts
// Safe: Zod guarantees email is a plain string
const { email, password } = req.body as LoginInput;
const user = await User.findOne({ email });
```

The pattern `Model.find(req.body)` or `Model.findOne(req.body)` is **never used**.

---

## 8. SQL Injection

This project uses MongoDB — there is no SQL database, so SQL injection is not a direct threat. The secure design principle still applies:

- Never concatenate user input into query strings.
- Use parameterized queries / ODM methods.
- Validate and constrain all input shapes.

If the project were to migrate to PostgreSQL, parameterized queries (via `pg` or Prisma) would be mandatory.

---

## 9. Mass Assignment Protection

Direct pattern avoided:

```ts
// DANGEROUS — never used in this codebase
Model.findByIdAndUpdate(id, req.body)
```

Every controller explicitly whitelists what fields can be updated:

```ts
// Explicit whitelist — fields not in this list cannot be modified
const { name, price, billingCycle, features, highlighted, displayOrder, published } = req.body;
const updatePayload = {};
if (name !== undefined) updatePayload.name = name;
// ...
```

This prevents clients from modifying `createdAt`, `updatedAt`, internal fields, or escalating roles.

---

## 10. IDOR / BOLA (Broken Object Level Authorization)

Every admin endpoint checks `authenticate` + `requireAdmin` before performing any operation. There is no per-resource ownership check because all admin-accessible resources are globally accessible to any admin.

Public endpoints only return `published: true` records. A public user cannot:
- Access draft posts by guessing an ID or slug
- Access admin endpoints by changing a URL

---

## 11. Privilege Escalation

The `role` field:
- Is set **server-side only** during user creation (seed script).
- Is **never accepted** from any request body, query parameter, or header.
- Is **never exposed** as a modifiable endpoint.
- Is read from the verified JWT payload (which is signed server-side).

There is no user registration endpoint. No endpoint allows `role` modification.

---

## 12. CSRF

**Token storage:** JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>`.

**CSRF risk with localStorage Bearer tokens:** Browser-based CSRF attacks cannot set the `Authorization` header from a cross-origin page, because:
- The attacker's page cannot read the token from localStorage (SOP prevents this).
- XMLHttpRequest/fetch from a different origin cannot set `Authorization` due to CORS.

Therefore, **CSRF is not a meaningful threat for Bearer token authentication** — a malicious page cannot forge a credentialed request without stealing the token first (which requires XSS).

**Tradeoff:** If this were cookie-based authentication, CSRF tokens would be required for state-changing operations. See Known Limitations.

---

## 13. CORS

CORS is configured with an explicit origin allowlist:

```ts
cors({
  origin: env.frontendUrl,  // e.g. http://localhost:3000 or https://yourapp.vercel.app
  credentials: true,
})
```

`origin: "*"` is **never used**.

**CORS is not an authentication mechanism.** CORS prevents browser-based cross-origin requests but does not protect APIs from direct HTTP clients (curl, Postman). Authentication and authorization middleware does that.

---

## 14. Security Headers (Helmet)

Helmet is applied globally. Relevant headers:

| Header | Purpose |
|---|---|
| `X-Content-Type-Options: nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options: SAMEORIGIN` | Prevents clickjacking |
| `Referrer-Policy` | Controls referrer information |
| `Strict-Transport-Security` | Forces HTTPS (enabled by Helmet in production) |
| `Cross-Origin-Opener-Policy` | Isolates browsing context |

**Note on CSP:** Helmet's default CSP is applied. The `@uiw/react-md-editor` requires `unsafe-eval` in the admin editor due to its CodeMirror dependency. This is a known tradeoff. The editor is only accessible to authenticated admins, so the XSS risk surface is limited.

The obsolete `X-XSS-Protection` header is **not relied upon** as an XSS defense.

---

## 15. Rate Limiting

```
Login:         10 requests / 15 minutes / IP → HTTP 429
Admin writes:  60 requests / 15 minutes / IP → HTTP 429
```

Purpose: Mitigates brute-force login attempts and write endpoint abuse. Does not prevent distributed attacks (no global rate limiting across IPs without a Redis store).

---

## 16. Input Validation

All write endpoints validate with Zod before controllers execute. Validation errors return HTTP 400 with a field error map:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "slug": "Slug must be lowercase, alphanumeric, and hyphen-separated" }
}
```

The server never silently ignores invalid input.

---

## 17. Request Size Limits

```ts
app.use(express.json({ limit: '1mb' }));
```

Requests over 1MB are rejected with HTTP 413. This protects against large-payload DoS attacks on the body parser.

---

## 18. Dependency Security

Security review date: **2026-09-05**

- Express upgraded from 4.22.x → 5.x (resolves `qs` and `body-parser` moderate CVEs)
- Next.js upgraded from 14.2.35 → 16.x (resolves multiple high-severity CVEs)
- `npm audit` result: `found 0 vulnerabilities` on both frontend and backend

Principle: prefer upgrading over ignoring. Breaking changes reviewed before applying.

---

## 19. Secrets Management

- `.env` files are in `.gitignore`
- `.env.example` files are committed with placeholder values only
- JWT secret is a minimum 32-character random string (never hardcoded)
- No secrets in logs, responses, or error messages

---

## 20. Secure Logging

The server logs:
- `[db] MongoDB connected`
- `[server] Flowmetrics API listening on port X`
- `[unexpected error]` with error details (server-side only, never in response)

The server **never logs**:
- Passwords or password hashes
- JWT tokens
- Authorization headers
- MongoDB credentials

---

## 21. Deployment Security

- Backend on Render over HTTPS
- Frontend on Vercel over HTTPS
- MongoDB Atlas with IP allowlist
- All secrets in platform environment variables, not committed code
- `NODE_ENV=production` in Render (removes dev-mode stack traces from responses)

---

## 22. Known Limitations

1. **localStorage token storage**: Vulnerable to XSS. Mitigated by Markdown sanitization and no raw HTML injection. A production system would use HttpOnly cookies + CSRF tokens.
2. **No account lockout**: Rate limiting is the only defense against repeated login attempts.
3. **No token revocation**: Tokens cannot be invalidated without changing the JWT secret (which logs out all sessions). A production system would use a token blocklist (Redis) or short-lived tokens + refresh token rotation.
4. **MongoDB IP allowlist**: On free Render tier, a static IP is unavailable; `0.0.0.0/0` may be needed. Production deployment should use a paid plan with a static IP.
5. **`unsafe-eval` in admin CSP**: Required by the Markdown editor's CodeMirror dependency. Acceptable for admin-only use, but worth replacing with a CSP-compliant editor in production.
6. **No audit log**: Admin actions are not logged for later review.

---

## 23. Responsible Disclosure

This is an internship portfolio project. If you find a security issue:
- Open a GitHub issue (if the repository is public)
- Or contact the repository owner directly

Do not test against systems you do not own.
