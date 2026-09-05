import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env";
import { BlogPost } from "../models/BlogPost";
import { PricingPlan } from "../models/PricingPlan";
import { User } from "../models/User";
import { WorkLog } from "../models/WorkLog";

async function seed() {
  await mongoose.connect(env.mongodbUri);
  console.log("[seed] Connected to MongoDB");

  // --- Admin user ---
  const adminEmail = "admin@flowmetrics.dev";
  const adminPassword = "ChangeMe123!"; // LOCAL DEV ONLY

  await User.deleteOne({ email: adminEmail });
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: "Flowmetrics Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
    department: "Executive Management",
  });
  console.log(`[seed] Admin user created: ${adminEmail} / ${adminPassword}`);

  // --- Employee users ---
  const defaultEmpPass = await bcrypt.hash("Employee123!", 10);

  const employeeData = [
    {
      name: "Alex Rivera",
      email: "alex@flowmetrics.dev",
      department: "Frontend Engineering",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    {
      name: "Priya Nair",
      email: "priya@flowmetrics.dev",
      department: "Backend & Systems",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
    {
      name: "Marcus Chen",
      email: "marcus@flowmetrics.dev",
      department: "UI/UX Product Design",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  ];

  const createdEmployees = [];
  for (const emp of employeeData) {
    await User.deleteOne({ email: emp.email });
    const user = await User.create({
      name: emp.name,
      email: emp.email,
      passwordHash: defaultEmpPass,
      role: "employee",
      department: emp.department,
      avatar: emp.avatar,
    });
    createdEmployees.push(user);
    console.log(`[seed] Employee created: ${emp.email} / Employee123!`);
  }

  // --- Work logs for employees ---
  await WorkLog.deleteMany({});

  const sampleTasks = [
    { project: "Mobile App Redesign", title: "Implement dark mode theme & glass cards", hours: 7.5, status: "completed", focus: 92 },
    { project: "Mobile App Redesign", title: "Refactor state management in navigation", hours: 6.0, status: "completed", focus: 88 },
    { project: "API Infrastructure", title: "Optimize DB queries for capacity dashboard", hours: 8.0, status: "completed", focus: 95 },
    { project: "API Infrastructure", title: "Implement rate limiting & JWT verification", hours: 7.0, status: "completed", focus: 90 },
    { project: "Customer Portal", title: "Design wireframes for team progress view", hours: 5.5, status: "in_progress", focus: 84 },
    { project: "Customer Portal", title: "Resolve CORS issue on staging server", hours: 4.0, status: "blocked", focus: 75 },
    { project: "API Infrastructure", title: "Write unit tests for authentication handlers", hours: 6.5, status: "completed", focus: 91 },
  ];

  for (let i = 0; i < createdEmployees.length; i++) {
    const emp = createdEmployees[i];
    const empTasks = sampleTasks.slice(i * 2, i * 2 + 3);
    for (const t of empTasks) {
      await WorkLog.create({
        user: emp._id,
        projectName: t.project,
        taskTitle: t.title,
        hoursSpent: t.hours,
        status: t.status,
        focusScore: t.focus,
        date: new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000),
      });
    }
  }
  console.log("[seed] Work logs created for employees");

  // --- Pricing plans ---
  await PricingPlan.deleteMany({});
  await PricingPlan.insertMany([
    {
      name: "Starter",
      price: 0,
      billingCycle: "monthly",
      features: ["Up to 5 team members", "Basic time tracking", "7-day activity history", "Email support"],
      highlighted: false,
      displayOrder: 1,
      published: true,
    },
    {
      name: "Team",
      price: 19,
      billingCycle: "monthly",
      features: [
        "Up to 25 team members",
        "Advanced workload analytics",
        "Unlimited activity history",
        "Project progress dashboards",
        "Priority email support",
      ],
      highlighted: true,
      displayOrder: 2,
      published: true,
    },
    {
      name: "Business",
      price: 49,
      billingCycle: "monthly",
      features: [
        "Unlimited team members",
        "Custom reports & exports",
        "Capacity planning tools",
        "SSO-ready roadmap",
        "Dedicated onboarding",
      ],
      highlighted: false,
      displayOrder: 3,
      published: true,
    },
  ]);
  console.log("[seed] Pricing plans created");

  // --- Blog posts ---
  await BlogPost.deleteMany({});
  const now = new Date();
  await BlogPost.insertMany([
    {
      title: "How to Identify Team Workload Bottlenecks",
      slug: "identify-team-workload-bottlenecks",
      excerpt: "Bottlenecks rarely announce themselves. Here's how to spot them in your team's workflow before they cost you a sprint.",
      content:
        "## Where bottlenecks hide\n\nMost workload bottlenecks aren't dramatic — they're a single person quietly becoming the approval gate for everything.\n\n### Signs to watch for\n\n- Tasks stall at the same stage repeatedly\n- One teammate is tagged on every review\n- Cycle time grows even as task count stays flat\n\nFlowmetrics surfaces these patterns automatically by tracking time-in-stage across your workflow, not just total hours logged.",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
      author: "Priya Nair",
      featured: true,
      published: true,
      publishedAt: now,
    },
    {
      title: "The Hidden Cost of Context Switching",
      slug: "hidden-cost-of-context-switching",
      excerpt: "Every Slack ping and tab switch has a price tag. We break down what constant context switching actually costs a team.",
      content:
        "## The 23-minute problem\n\nResearch on task-switching consistently finds it takes over 20 minutes to fully refocus after an interruption.\n\n### What this means for your team\n\nIf your team switches context 6–8 times a day, that's hours of lost depth, not just lost minutes.\n\nFlowmetrics' focus-time reporting helps teams protect blocks of uninterrupted work.",
      coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200",
      author: "Marcus Chen",
      featured: true,
      published: true,
      publishedAt: now,
    },
    {
      title: "Building Healthier Remote Workflows",
      slug: "building-healthier-remote-workflows",
      excerpt: "Remote work removed the commute, but it also removed the natural start and end to a workday. Here's how to rebuild those boundaries.",
      content:
        "## Boundaries don't happen by accident\n\nWithout an office to leave, many remote workers simply never clock out mentally.\n\n### Practical fixes\n\n1. Set explicit 'core hours' visible to the whole team\n2. Use async status updates instead of always-on chat\n3. Review workload data weekly, not just when someone burns out\n\nFlowmetrics gives managers early visibility into overwork patterns.",
      coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
      author: "Priya Nair",
      featured: false,
      published: true,
      publishedAt: now,
    },
    {
      title: "Understanding Team Capacity",
      slug: "understanding-team-capacity",
      excerpt: "Capacity isn't just headcount times hours. Here's a more realistic way to think about what your team can actually take on.",
      content:
        "## Capacity is not a spreadsheet formula\n\nA team of 5 working 40-hour weeks does not have '200 hours of capacity.' Meetings, reviews, and support work eat into that number every week.\n\n### A better model\n\nTrack *available focus capacity* separately from raw hours, and revisit it monthly as team composition and responsibilities shift.",
      coverImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200",
      author: "Sofia Alvarez",
      featured: false,
      published: true,
      publishedAt: now,
    },
    {
      title: "What's New in Flowmetrics",
      slug: "whats-new-in-flowmetrics",
      excerpt: "A roundup of the latest features shipped this quarter, from new dashboards to workload alerts.",
      content:
        "## This quarter's highlights\n\n- New team capacity dashboard\n- Configurable workload alerts\n- Faster report exports\n\nMore detail on each of these is coming in follow-up posts.",
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
      author: "Flowmetrics Team",
      featured: false,
      published: true,
      publishedAt: now,
    },
    {
      title: "Draft: Q3 Roadmap Preview (Internal Review)",
      slug: "q3-roadmap-preview-draft",
      excerpt: "Early draft of the Q3 roadmap post — not yet ready for public visibility.",
      content: "## Draft content\n\nThis post is intentionally left unpublished to verify that draft content never leaks through the public API.",
      coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
      author: "Flowmetrics Team",
      featured: false,
      published: false,
      publishedAt: null,
    },
  ]);
  console.log("[seed] Blog posts created");

  await mongoose.disconnect();
  console.log("[seed] Done. Disconnected.");
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
