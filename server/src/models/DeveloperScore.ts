import mongoose, { Document, Schema } from "mongoose";

export interface IDeveloperScore extends Document {
  userId: mongoose.Types.ObjectId;
  overallScore: number;
  githubScore: number;
  resumeScore: number;
  jobMatchScore: number;
  interviewScore: number;
  profileScore: number;
  strengths: any[];
  weaknesses: any[];
  recommendations: any[];
  suggestedProjects: any[];
  certifications: any[];
  jobRoles: any[];
  aiInsights: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const developerScoreSchema = new Schema<IDeveloperScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    overallScore: { type: Number, required: true },
    githubScore: { type: Number, required: true },
    resumeScore: { type: Number, required: true },
    jobMatchScore: { type: Number, required: true },
    interviewScore: { type: Number, required: true },
    profileScore: { type: Number, required: true },
    strengths: { type: Schema.Types.Mixed, default: [] },
    weaknesses: { type: Schema.Types.Mixed, default: [] },
    recommendations: { type: Schema.Types.Mixed, default: [] },
    suggestedProjects: { type: Schema.Types.Mixed, default: [] },
    certifications: { type: Schema.Types.Mixed, default: [] },
    jobRoles: { type: Schema.Types.Mixed, default: [] },
    aiInsights: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const DeveloperScore = mongoose.model<IDeveloperScore>("DeveloperScore", developerScoreSchema);
