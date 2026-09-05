/**
 * Phase 2 — automated logic-level test pass.
 *
 * This sandbox has no MongoDB Atlas access, so these tests mock the
 * Mongoose model methods (find/create/findByIdAndUpdate/etc.) and
 * exercise the REAL Express app, controllers, middleware, and
 * validators around them. This proves the security-critical logic
 * (auth, role checks, validation, draft filtering) is correct.
 *
 * It does NOT prove MongoDB itself is wired correctly — that still
 * needs the manual curl pass against a real Atlas cluster (see
 * MANUAL_TEST_CHECKLIST.md).
 *
 * Run with: npx ts-node test/manual-test.ts
 */
process.env.MONGODB_URI = "mongodb://localhost:27017/flowmetrics_test";
process.env.JWT_SECRET = "test-secret-for-logic-tests-only";
process.env.FRONTEND_URL = "http://localhost:3000";

import assert from "node:assert";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { User } = require("../src/models/User");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PricingPlan } = require("../src/models/PricingPlan");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { BlogPost } = require("../src/models/BlogPost");

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    passed++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    failed++;
  }
}

async function main() {
  // ---- Mock User model ----
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 10);
  const fakeAdmin = {
    id: "507f1f77bcf86cd799439011",
    name: "Flowmetrics Admin",
    email: "admin@flowmetrics.dev",
    passwordHash: adminPasswordHash,
    role: "admin",
  };
  User.findOne = async ({ email }: { email: string }) => (email === fakeAdmin.email ? fakeAdmin : null);

  // ---- Mock PricingPlan model ----
  const pricingCalls: { method: string; args: unknown[] }[] = [];
  const fakePlans = [{ _id: "p1", name: "Team", published: true, displayOrder: 1 }];
  PricingPlan.find = (filter: unknown) => {
    pricingCalls.push({ method: "find", args: [filter] });
    return { sort: async () => fakePlans };
  };
  PricingPlan.create = async (data: unknown) => {
    pricingCalls.push({ method: "create", args: [data] });
    return { _id: "new-plan", ...(data as object) };
  };
  PricingPlan.findByIdAndUpdate = async (id: string, data: unknown) => {
    pricingCalls.push({ method: "findByIdAndUpdate", args: [id, data] });
    return { _id: id, ...(data as object) };
  };
  PricingPlan.findByIdAndDelete = async (id: string) => {
    pricingCalls.push({ method: "findByIdAndDelete", args: [id] });
    return { _id: id };
  };

  // ---- Mock BlogPost model ----
  const blogCalls: { method: string; args: unknown[] }[] = [];
  const publishedPost = { _id: "b1", slug: "hello-world", published: true, title: "Hello" };
  const draftPost = { _id: "b2", slug: "secret-draft", published: false, title: "Secret" };
  BlogPost.find = (filter: Record<string, unknown>) => {
    blogCalls.push({ method: "find", args: [filter] });
    const results = filter?.published === true ? [publishedPost] : [publishedPost, draftPost];
    return { sort: async () => results };
  };
  BlogPost.findOne = async (filter: Record<string, unknown>) => {
    blogCalls.push({ method: "findOne", args: [filter] });
    if (filter.slug === "hello-world" && filter.published === true) return publishedPost;
    // Simulates the DB-level filter: a draft slug + published:true never matches.
    return null;
  };
  BlogPost.create = async (data: unknown) => ({ _id: "new-post", ...(data as object) });
  BlogPost.findById = async (id: string) => (id === "b1" ? publishedPost : null);
  BlogPost.findByIdAndUpdate = async (id: string, data: unknown) => ({ _id: id, ...(data as object) });
  BlogPost.findByIdAndDelete = async (id: string) => (id === "b1" ? { _id: id } : null);

  // Now require app AFTER mocks are in place, so controllers see mocked models.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const app = require("../src/app").default;
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const port = (server.address() as { port: number }).port;
  const base = `http://localhost:${port}`;

  console.log("\n=== AUTH ===");
  {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@flowmetrics.dev", password: "ChangeMe123!" }),
    });
    const body: any = await res.json();
    check("correct login returns 200", res.status === 200);
    check("correct login returns a token", typeof body.data?.token === "string");
    check("correct login never returns passwordHash", body.data?.user?.passwordHash === undefined);
  }
  {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@flowmetrics.dev", password: "WrongPassword1" }),
    });
    check("wrong password returns 401", res.status === 401);
  }
  {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody@flowmetrics.dev", password: "WhoKnows123" }),
    });
    check("nonexistent user returns 401 (not 404 — no user enumeration)", res.status === 401);
  }
  {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "short" }),
    });
    const body: any = await res.json();
    check("invalid login payload returns 400 with field errors", res.status === 400 && !!body.errors?.email);
  }

  console.log("\n=== ROLE-BASED AUTHORIZATION (not just 'token exists') ===");
  const adminToken = jwt.sign({ id: fakeAdmin.id, role: "admin" }, process.env.JWT_SECRET as string);
  const nonAdminToken = jwt.sign({ id: "someone-else", role: "editor" }, process.env.JWT_SECRET as string);
  const garbageToken = "this.is.not.a.jwt";

  {
    const res = await fetch(`${base}/api/admin/pricing`);
    check("no token on admin route -> 401", res.status === 401);
  }
  {
    const res = await fetch(`${base}/api/admin/pricing`, { headers: { Authorization: `Bearer ${garbageToken}` } });
    check("garbage token on admin route -> 401", res.status === 401);
  }
  {
    const res = await fetch(`${base}/api/admin/pricing`, { headers: { Authorization: `Bearer ${nonAdminToken}` } });
    check("valid JWT but non-admin role -> 403 (proves role IS checked, not just token presence)", res.status === 403);
  }
  {
    const res = await fetch(`${base}/api/admin/pricing`, { headers: { Authorization: `Bearer ${adminToken}` } });
    check("valid admin JWT on admin route -> 200", res.status === 200);
  }

  console.log("\n=== PRICING VALIDATION + CRUD ===");
  {
    const res = await fetch(`${base}/api/admin/pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: "X", price: -5, billingCycle: "weekly", features: [] }),
    });
    const body: any = await res.json();
    check("invalid pricing payload -> 400 with errors", res.status === 400);
    check("400 flags negative price", !!body.errors?.price);
    check("400 flags bad billingCycle enum", !!body.errors?.billingCycle);
    check("400 flags empty features array", !!body.errors?.features);
  }
  {
    const res = await fetch(`${base}/api/admin/pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: "Team",
        price: 19,
        billingCycle: "monthly",
        features: ["A", "B"],
        highlighted: true,
      }),
    });
    check("valid pricing payload -> 201", res.status === 201);
  }
  {
    const res = await fetch(`${base}/api/pricing`);
    // Use the LAST find() call, since the admin-authorization block above
    // already exercised the admin (unfiltered) list endpoint.
    const findCalls = pricingCalls.filter((c) => c.method === "find");
    const filterUsed = findCalls[findCalls.length - 1]?.args[0];
    check("public pricing endpoint returns 200", res.status === 200);
    check(
      "public pricing query filters by published:true at DB level",
      JSON.stringify(filterUsed) === JSON.stringify({ published: true })
    );
  }
  {
    // Public caller should never reach admin write routes at all.
    const res = await fetch(`${base}/api/pricing`, { method: "POST" });
    check("public cannot POST to /api/pricing (route doesn't exist there) -> 404", res.status === 404);
  }

  console.log("\n=== BLOG VALIDATION + DRAFT PROTECTION ===");
  {
    const res = await fetch(`${base}/api/blog`);
    const body: any = await res.json();
    const filterUsed = blogCalls.find((c) => c.method === "find")?.args[0];
    check("public blog list -> 200", res.status === 200);
    check(
      "public blog query filters by published:true at DB level",
      JSON.stringify(filterUsed) === JSON.stringify({ published: true })
    );
    check(
      "draft post is NOT present in public blog list response",
      !body.data.some((p: { slug: string }) => p.slug === "secret-draft")
    );
  }
  {
    const res = await fetch(`${base}/api/blog/slug/hello-world`);
    check("public slug lookup of a published post -> 200", res.status === 200);
  }
  {
    const res = await fetch(`${base}/api/blog/slug/secret-draft`);
    check("public slug lookup of a DRAFT post -> 404 (never leaks draft existence or content)", res.status === 404);
  }
  {
    const res = await fetch(`${base}/api/admin/blog`, { headers: { Authorization: `Bearer ${adminToken}` } });
    check("admin blog list (no auth token filter needed) -> 200", res.status === 200);
  }
  {
    const res = await fetch(`${base}/api/admin/blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: "Hi", slug: "Not A Valid Slug!", excerpt: "short", content: "short" }),
    });
    const body: any = await res.json();
    check("invalid blog payload -> 400", res.status === 400);
    check("400 flags bad slug format", !!body.errors?.slug);
    check("400 flags short excerpt", !!body.errors?.excerpt);
    check("400 flags missing coverImage URL", !!body.errors?.coverImage);
  }
  {
    const res = await fetch(`${base}/api/admin/blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "A Valid Post Title",
        slug: "a-valid-post-title",
        excerpt: "This is a sufficiently long excerpt for validation.",
        content: "This is sufficiently long markdown content for validation to pass.",
        coverImage: "https://images.unsplash.com/photo-example",
        author: "Test Author",
        published: true,
      }),
    });
    check("valid blog payload -> 201", res.status === 201);
  }

  console.log("\n=== EMPLOYEE PROGRESS & TEAM ANALYTICS ===");
  {
    User.find = () => ({
      select: async () => [
        { _id: "emp1", name: "Alex Rivera", email: "alex@flowmetrics.dev", role: "employee", department: "Frontend" },
      ],
    });
    const { WorkLog } = require("../src/models/WorkLog");
    WorkLog.find = () => ({
      populate: () => ({
        sort: () => [
          {
            _id: "w1",
            user: "emp1",
            projectName: "Mobile App",
            taskTitle: "Design dark mode",
            hoursSpent: 7.5,
            status: "completed",
            focusScore: 90,
            date: new Date(),
          },
        ],
      }),
      sort: () => [
        {
          _id: "w1",
          user: fakeAdmin.id,
          projectName: "Mobile App",
          taskTitle: "Design dark mode",
          hoursSpent: 7.5,
          status: "completed",
          focusScore: 90,
          date: new Date(),
        },
      ],
    });
    WorkLog.create = async (data: unknown) => ({ _id: "new-worklog", ...(data as object) });

    const resProgress = await fetch(`${base}/api/employee/progress`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const bodyProgress: any = await resProgress.json();
    check("employee progress endpoint returns 200", resProgress.status === 200);
    check("returns weekly hours count", bodyProgress.data?.weeklyHours === 7.5);

    const resLog = await fetch(`${base}/api/employee/worklog`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        projectName: "API Infrastructure",
        taskTitle: "Add rate limiter middleware",
        hoursSpent: 4.5,
        status: "completed",
      }),
    });
    check("creating work log returns 201", resLog.status === 201);

    const resTeam = await fetch(`${base}/api/admin/team`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    check("admin team analytics returns 200", resTeam.status === 200);
  }

  console.log("\n=== ERROR HANDLING ===");
  {
    const res = await fetch(`${base}/api/does-not-exist`);
    check("unknown route -> 404 with consistent shape", res.status === 404);
  }

  console.log("\n=== RATE LIMITING (login) ===");
  {
    let sawLimitHit = false;
    for (let i = 0; i < 12; i++) {
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@flowmetrics.dev", password: "WrongPassword1" }),
      });
      if (res.status === 429) sawLimitHit = true;
    }
    check("11th+ login attempt within window returns 429", sawLimitHit);
  }

  server.close();

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});
