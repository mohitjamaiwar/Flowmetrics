import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import { adminBlogRouter, publicBlogRouter } from "./routes/blogRoutes";
import { adminPricingRouter, publicPricingRouter } from "./routes/pricingRoutes";

const app = express();

// --- Core security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// --- Health check (useful for Render + quick sanity checks) ---
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Flowmetrics API is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);

// Employee workspace endpoints
app.use("/api/employee", employeeRoutes);

// Public content endpoints
app.use("/api/pricing", publicPricingRouter);
app.use("/api/blog", publicBlogRouter);

// Admin content endpoints (auth + role-check applied inside these routers)
app.use("/api/admin", adminRoutes);
app.use("/api/admin/pricing", adminPricingRouter);
app.use("/api/admin/blog", adminBlogRouter);

// --- 404 + centralized error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
