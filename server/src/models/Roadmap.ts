import mongoose, { Document, Schema } from "mongoose";

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  path: string;
  roadmap: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapSchema = new Schema<IRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    path: { type: String, required: true },
    roadmap: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>("Roadmap", roadmapSchema);
