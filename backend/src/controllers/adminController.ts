import { Request, Response } from "express";
import { BlogPost } from "../models/BlogPost";
import { PricingPlan } from "../models/PricingPlan";
import { asyncHandler } from "../utils/asyncHandler";

// ADMIN: dashboard summary counts.
export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalPlans, totalPosts, publishedPosts, draftPosts, featuredPosts] = await Promise.all([
    PricingPlan.countDocuments(),
    BlogPost.countDocuments(),
    BlogPost.countDocuments({ published: true }),
    BlogPost.countDocuments({ published: false }),
    BlogPost.countDocuments({ featured: true, published: true }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPlans,
      totalPosts,
      publishedPosts,
      draftPosts,
      featuredPosts,
    },
  });
});
