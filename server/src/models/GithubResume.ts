import mongoose, { Document, Schema } from "mongoose";

export interface IGithubResume extends Document {
  userId: mongoose.Types.ObjectId;
  githubUsername: string;
  developerType: string;
  profileStrength: number;
  badges: any[];
  resumeData: Record<string, any>;
  insights: Record<string, any>;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const githubResumeSchema = new Schema<IGithubResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    githubUsername: { type: String, required: true },
    developerType: { type: String, required: true },
    profileStrength: { type: Number, default: 0 },
    badges: { type: Schema.Types.Mixed, default: [] },
    resumeData: { type: Schema.Types.Mixed, required: true },
    insights: { type: Schema.Types.Mixed, default: {} },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const GithubResume = mongoose.model<IGithubResume>("GithubResume", githubResumeSchema);
