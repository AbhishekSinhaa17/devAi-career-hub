import mongoose, { Document, Schema } from "mongoose";

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: Record<string, any>;
  score: number;
  aiSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "My Resume", required: true },
    content: { type: Schema.Types.Mixed, default: {} },
    score: { type: Number, default: 0 },
    aiSuggestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>("Resume", resumeSchema);
