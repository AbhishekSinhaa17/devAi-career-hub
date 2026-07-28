import mongoose, { Document, Schema } from "mongoose";

export interface IGithubAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  githubUsername: string;
  score: number;
  stats: Record<string, any>;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const githubAnalysisSchema = new Schema<IGithubAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    githubUsername: { type: String, required: true },
    score: { type: Number, default: 0 },
    stats: { type: Schema.Types.Mixed, default: {} },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    summary: { type: String },
  },
  { timestamps: true }
);

export const GithubAnalysis = mongoose.model<IGithubAnalysis>("GithubAnalysis", githubAnalysisSchema);
