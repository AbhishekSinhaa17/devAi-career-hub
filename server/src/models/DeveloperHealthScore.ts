import mongoose, { Document, Schema } from "mongoose";

export interface IDeveloperHealthScore extends Document {
  userId: mongoose.Types.ObjectId;
  githubScore: number;
  resumeScore: number;
  interviewScore: number;
  jobMatchScore: number;
  portfolioScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const developerHealthScoreSchema = new Schema<IDeveloperHealthScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    githubScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    interviewScore: { type: Number, default: 0 },
    jobMatchScore: { type: Number, default: 0 },
    portfolioScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const DeveloperHealthScore = mongoose.model<IDeveloperHealthScore>("DeveloperHealthScore", developerHealthScoreSchema);
