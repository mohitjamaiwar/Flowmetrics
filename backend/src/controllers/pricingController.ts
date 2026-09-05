import { Request, Response } from "express";
import mongoose from "mongoose";
import { PricingPlan } from "../models/PricingPlan";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  CreatePricingPlanInput,
  UpdatePricingPlanInput,
} from "../validators/pricingValidators";

// PUBLIC: only published plans, ordered for display.
export const getPublicPricingPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await PricingPlan.find({ published: true }).sort({ displayOrder: 1 });
  res.status(200).json({ success: true, data: plans });
});

// ADMIN: every plan, published or not.
export const getAllPricingPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await PricingPlan.find().sort({ displayOrder: 1 });
  res.status(200).json({ success: true, data: plans });
});

export const createPricingPlan = asyncHandler(async (req: Request, res: Response) => {
  // Explicitly whitelist creatable fields to prevent mass assignment.
  const { name, price, billingCycle, features, highlighted, displayOrder, published } =
    req.body as CreatePricingPlanInput;

  const plan = await PricingPlan.create({
    name,
    price,
    billingCycle,
    features,
    highlighted,
    displayOrder,
    published,
  });
  res.status(201).json({ success: true, message: "Pricing plan created", data: plan });
});

export const updatePricingPlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ObjectId before hitting the DB.
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid plan ID", 400);
  }

  // Explicitly whitelist updateable fields to prevent mass assignment.
  const {
    name,
    price,
    billingCycle,
    features,
    highlighted,
    displayOrder,
    published,
  } = req.body as UpdatePricingPlanInput;

  const updatePayload: Partial<{
    name: string;
    price: number;
    billingCycle: string;
    features: string[];
    highlighted: boolean;
    displayOrder: number;
    published: boolean;
  }> = {};

  if (name !== undefined) updatePayload.name = name;
  if (price !== undefined) updatePayload.price = price;
  if (billingCycle !== undefined) updatePayload.billingCycle = billingCycle;
  if (features !== undefined) updatePayload.features = features;
  if (highlighted !== undefined) updatePayload.highlighted = highlighted;
  if (displayOrder !== undefined) updatePayload.displayOrder = displayOrder;
  if (published !== undefined) updatePayload.published = published;

  const plan = await PricingPlan.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!plan) {
    throw new AppError("Pricing plan not found", 404);
  }
  res.status(200).json({ success: true, message: "Pricing plan updated", data: plan });
});

export const deletePricingPlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid plan ID", 400);
  }

  const plan = await PricingPlan.findByIdAndDelete(id);
  if (!plan) {
    throw new AppError("Pricing plan not found", 404);
  }
  res.status(200).json({ success: true, message: "Pricing plan deleted" });
});
