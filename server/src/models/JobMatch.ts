import mongoose, { Document, Schema } from "mongoose";

export interface IJobMatch extends Document {
  userId: mongoose.Types.ObjectId;
  jobRole: string;
  jobDescription: string;
  resumeFileName: string;
  resumeText: string;
  atsScore: number;
  hiringProbability: number;
  interviewReadiness: number;
  aiSummary?: string;
  analysis: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const jobMatchSchema = new Schema<IJobMatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobRole: { type: String, required: true },
    jobDescription: { type: String, required: true },
    resumeFileName: { type: String, required: true },
    resumeText: { type: String, required: true },
    atsScore: { type: Number, required: true },
    hiringProbability: { type: Number, required: true },
    interviewReadiness: { type: Number, required: true },
    aiSummary: { type: String },
    analysis: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const JobMatch = mongoose.model<IJobMatch>("JobMatch", jobMatchSchema);
