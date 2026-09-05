# Flowmetrics Backend — Manual Test Checklist (against a real Atlas DB)

The automated suite in `test/manual-test.ts` mocks MongoDB and already proves
the security-critical logic is correct (auth, role checks, validation, draft
filtering, rate limiting) — see `PHASE_2_RESULTS.md`. Run this checklist once
you have a real `MONGODB_URI` set, to confirm the DB wiring itself works.

Setup:
```bash
cd backend
npm install
cp .env.example .env      # fill in MONGODB_URI + JWT_SECRET
npm run seed                # creates admin user, 3 pricing plans, 6 blog posts (1 draft)
npm run dev                  # starts on http://localhost:5000
```

## 1. Health
```bash
curl http://localhost:5000/api/health
```
Expect: `200`, `{"success":true,...}`

## 2. Auth
```bash
# Correct login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@flowmetrics.dev","password":"ChangeMe123!"}'
# Expect: 200, a token, user object WITHOUT passwordHash

# Wrong password
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@flowmetrics.dev","password":"WrongPassword1"}'
# Expect: 401

# Nonexistent user
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"nobody@flowmetrics.dev","password":"WhateverPass1"}'
# Expect: 401 (same message as wrong password — no user enumeration)
```
Save the token from the correct login:
```bash
TOKEN="paste-token-here"
```

## 3. Pricing — public
```bash
curl http://localhost:5000/api/pricing
```
Expect: 200, array of 3 plans, all `published:true`, "Team" has `highlighted:true`.

## 4. Pricing — admin CRUD
```bash
# No token
curl -i http://localhost:5000/api/admin/pricing
# Expect: 401

# With token
curl http://localhost:5000/api/admin/pricing -H "Authorization: Bearer $TOKEN"
# Expect: 200, all plans

# Create (invalid — negative price)
curl -i -X POST http://localhost:5000/api/admin/pricing -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"X","price":-5,"billingCycle":"weekly","features":[]}'
# Expect: 400 with field errors for price, billingCycle, features

# Create (valid)
curl -i -X POST http://localhost:5000/api/admin/pricing -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Enterprise","price":99,"billingCycle":"monthly","features":["SSO","SLA"],"highlighted":false,"displayOrder":4}'
# Expect: 201, copy the returned _id

# Update
curl -i -X PUT http://localhost:5000/api/admin/pricing/<id> -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"highlighted":true}'
# Expect: 200

# Delete
curl -i -X DELETE http://localhost:5000/api/admin/pricing/<id> -H "Authorization: Bearer $TOKEN"
# Expect: 200
```

## 5. Blog — draft protection (the critical one)
```bash
# Public list should NOT include the seeded draft
curl http://localhost:5000/api/blog | grep -c "q3-roadmap-preview-draft"
# Expect: 0

# Public slug lookup of the draft directly
curl -i http://localhost:5000/api/blog/slug/q3-roadmap-preview-draft
# Expect: 404 (not 200, not a leaked draft body)

# Admin CAN see the draft
curl http://localhost:5000/api/admin/blog -H "Authorization: Bearer $TOKEN" | grep -c "q3-roadmap-preview-draft"
# Expect: 1
```

## 6. Blog — CRUD + validation
```bash
# Invalid slug format
curl -i -X POST http://localhost:5000/api/admin/blog -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hi","slug":"Not Valid!","excerpt":"short","content":"short","coverImage":"not-a-url","author":"A"}'
# Expect: 400 with errors for slug, excerpt, coverImage

# Valid create
curl -i -X POST http://localhost:5000/api/admin/blog -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","slug":"test-post","excerpt":"A perfectly fine excerpt for testing purposes.","content":"Enough markdown content here to pass validation.","coverImage":"https://images.unsplash.com/photo-test","author":"Tester","published":true}'
# Expect: 201, then check it shows up in curl http://localhost:5000/api/blog
```

## 7. Rate limiting
```bash
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" -d '{"email":"admin@flowmetrics.dev","password":"wrong"}'
done
# Expect: first 10 return 401, remaining return 429
```

## 8. Unauthorized writes
```bash
curl -i -X POST http://localhost:5000/api/pricing   # no such public write route -> 404
curl -i -X POST http://localhost:5000/api/blog       # no such public write route -> 404
curl -i -X POST http://localhost:5000/api/admin/pricing -H "Content-Type: application/json" -d '{}'  # no token -> 401
```

Once every item above matches its expected result, the backend is confirmed working end-to-end against real MongoDB and Phase 3 (frontend) can begin.
