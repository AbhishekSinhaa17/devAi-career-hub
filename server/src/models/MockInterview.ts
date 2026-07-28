import mongoose, { Document, Schema } from "mongoose";

export interface IMockInterview extends Document {
  userId: mongoose.Types.ObjectId;
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  questions: any[];
  answers: any[];
  overallScore: number;
  report: Record<string, any>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const mockInterviewSchema = new Schema<IMockInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobRole: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    interviewType: { type: String, required: true },
    questions: { type: Schema.Types.Mixed, default: [] },
    answers: { type: Schema.Types.Mixed, default: [] },
    overallScore: { type: Number, default: 0 },
    report: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, default: "in_progress" },
  },
  { timestamps: true }
);

export const MockInterview = mongoose.model<IMockInterview>("MockInterview", mockInterviewSchema);
