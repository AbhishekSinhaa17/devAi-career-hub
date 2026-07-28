import mongoose, { Document, Schema } from "mongoose";

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  category: string;
  questions: any[];
  createdAt: Date;
  updatedAt: Date;
}

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    category: { type: String, default: "general" },
    questions: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.model<IInterviewSession>("InterviewSession", interviewSessionSchema);
