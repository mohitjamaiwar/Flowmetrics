import { z } from "zod";

export const createPricingPlanSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  price: z.number().min(0, "Price cannot be negative"),
  billingCycle: z.enum(["monthly", "yearly"]),
  features: z
    .array(z.string().trim().min(1))
    .min(1, "At least one feature is required")
    .max(20),
  highlighted: z.boolean().optional().default(false),
  displayOrder: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

// All fields optional for PUT/PATCH-style updates, but each field
// that IS present must still satisfy the same rules.
export const updatePricingPlanSchema = createPricingPlanSchema.partial();

export type CreatePricingPlanInput = z.infer<typeof createPricingPlanSchema>;
export type UpdatePricingPlanInput = z.infer<typeof updatePricingPlanSchema>;
