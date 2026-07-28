import mongoose, { Document, Schema } from "mongoose";

export interface ICodeReview extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  code: string;
  feedback: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const codeReviewSchema = new Schema<ICodeReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    language: { type: String, default: "javascript", required: true },
    code: { type: String, required: true },
    feedback: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const CodeReview = mongoose.model<ICodeReview>("CodeReview", codeReviewSchema);
