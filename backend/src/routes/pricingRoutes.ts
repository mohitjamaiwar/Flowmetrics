import { Router } from "express";
import {
  createPricingPlan,
  deletePricingPlan,
  getAllPricingPlans,
  getPublicPricingPlans,
  updatePricingPlan,
} from "../controllers/pricingController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { writeRateLimiter } from "../middleware/rateLimiters";
import { validate } from "../middleware/validate";
import { createPricingPlanSchema, updatePricingPlanSchema } from "../validators/pricingValidators";

// Public router: mounted at /api/pricing
export const publicPricingRouter = Router();
publicPricingRouter.get("/", getPublicPricingPlans);

// Admin router: mounted at /api/admin/pricing
export const adminPricingRouter = Router();
adminPricingRouter.use(authenticate, requireAdmin);
adminPricingRouter.get("/", getAllPricingPlans);
adminPricingRouter.post("/", writeRateLimiter, validate(createPricingPlanSchema), createPricingPlan);
adminPricingRouter.put("/:id", writeRateLimiter, validate(updatePricingPlanSchema), updatePricingPlan);
adminPricingRouter.delete("/:id", writeRateLimiter, deletePricingPlan);
