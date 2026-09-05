import { Schema, model, Document, Types } from "mongoose";

export type WorkStatus = "completed" | "in_progress" | "blocked";

export interface IWorkLog extends Document {
  user: Types.ObjectId;
  projectName: string;
  taskTitle: string;
  hoursSpent: number;
  status: WorkStatus;
  date: Date;
  focusScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const workLogSchema = new Schema<IWorkLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectName: { type: String, required: true, trim: true },
    taskTitle: { type: String, required: true, trim: true },
    hoursSpent: { type: Number, required: true, min: 0.5, max: 24 },
    status: {
      type: String,
      enum: ["completed", "in_progress", "blocked"],
      required: true,
      default: "in_progress",
    },
    date: { type: Date, default: Date.now },
    focusScore: { type: Number, default: 85, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const WorkLog = model<IWorkLog>("WorkLog", workLogSchema);
