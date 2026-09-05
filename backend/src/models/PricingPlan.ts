import { Schema, model, Document } from "mongoose";

export type BillingCycle = "monthly" | "yearly";

export interface IPricingPlan extends Document {
  name: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  highlighted: boolean;
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
    features: { type: [String], default: [] },
    highlighted: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PricingPlan = model<IPricingPlan>("PricingPlan", pricingPlanSchema);
