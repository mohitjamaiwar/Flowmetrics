import { Router } from "express";
import {
  createBlogPost,
  deleteBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
  updateBlogPost,
} from "../controllers/blogController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { writeRateLimiter } from "../middleware/rateLimiters";
import { validate } from "../middleware/validate";
import { createBlogPostSchema, updateBlogPostSchema } from "../validators/blogValidators";

// Public router: mounted at /api/blog
export const publicBlogRouter = Router();
publicBlogRouter.get("/", getPublicBlogPosts);
publicBlogRouter.get("/slug/:slug", getPublicBlogPostBySlug);

// Admin router: mounted at /api/admin/blog
export const adminBlogRouter = Router();
adminBlogRouter.use(authenticate, requireAdmin);
adminBlogRouter.get("/", getAllBlogPosts);
adminBlogRouter.get("/:id", getBlogPostById);
adminBlogRouter.post("/", writeRateLimiter, validate(createBlogPostSchema), createBlogPost);
adminBlogRouter.put("/:id", writeRateLimiter, validate(updateBlogPostSchema), updateBlogPost);
adminBlogRouter.delete("/:id", writeRateLimiter, deleteBlogPost);
