import mongoose, { Document, Schema } from "mongoose";

export interface IPortfolioDeployment extends Document {
  userId: mongoose.Types.ObjectId;
  portfolioId?: mongoose.Types.ObjectId;
  provider: string;
  status: string;
  deploymentUrl?: string;
  errorMessage?: string;
  deploymentId?: string;
  buildDuration?: number;
  deploymentLogs: any[];
  deployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioDeploymentSchema = new Schema<IPortfolioDeployment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    portfolioId: { type: Schema.Types.ObjectId, ref: "GithubResume" },
    provider: { type: String, default: "Vercel" },
    status: { type: String, default: "pending" },
    deploymentUrl: { type: String },
    errorMessage: { type: String },
    deploymentId: { type: String },
    buildDuration: { type: Number },
    deploymentLogs: { type: Schema.Types.Mixed, default: [] },
    deployedAt: { type: Date },
  },
  { timestamps: true }
);

export const PortfolioDeployment = mongoose.model<IPortfolioDeployment>("PortfolioDeployment", portfolioDeploymentSchema);
