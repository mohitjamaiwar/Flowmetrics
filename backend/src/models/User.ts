import { Schema, model, Document } from "mongoose";

export type UserRole = "admin" | "employee";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], required: true, default: "employee" },
    department: { type: String, trim: true, default: "Engineering" },
    avatar: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
