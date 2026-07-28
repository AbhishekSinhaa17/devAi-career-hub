import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  googleId?: string;
  passwordHash?: string | null;
  name?: string;
  githubUsername?: string;
  bio?: string;
  avatarUrl?: string;
  skills: string[];
  experienceLevel: string;
  isPro: boolean;
  proExpiresAt?: Date;
  role: "admin" | "developer";
  badges: string[];
  interviewStreak: number;
  bestInterviewScore: number;
  totalInterviews: number;
  requiresPasswordReset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    googleId: { type: String, sparse: true },
    passwordHash: { type: String, default: null },
    name: { type: String },
    githubUsername: { type: String },
    bio: { type: String },
    avatarUrl: { type: String },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, default: "junior" },
    isPro: { type: Boolean, default: false },
    proExpiresAt: { type: Date },
    role: { type: String, enum: ["admin", "developer"], default: "developer" },
    badges: { type: [String], default: [] },
    interviewStreak: { type: Number, default: 0 },
    bestInterviewScore: { type: Number, default: 0 },
    totalInterviews: { type: Number, default: 0 },
    requiresPasswordReset: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
