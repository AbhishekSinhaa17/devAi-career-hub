import mongoose, { Document, Schema } from "mongoose";

export interface IAiUsageEvent extends Document {
  userId?: mongoose.Types.ObjectId;
  clientIp?: string;
  endpoint: string;
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  status: string;
  durationMs: number;
  createdAt: Date;
  updatedAt: Date;
}

const aiUsageEventSchema = new Schema<IAiUsageEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    clientIp: { type: String },
    endpoint: { type: String, required: true },
    aiModel: { type: String, required: true },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    costUsd: { type: Number, default: 0 },
    status: { type: String, default: "success" },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

aiUsageEventSchema.index({ createdAt: -1 });
aiUsageEventSchema.index({ userId: 1, createdAt: -1 });
aiUsageEventSchema.index({ clientIp: 1, createdAt: -1 });

export const AiUsageEvent = mongoose.model<IAiUsageEvent>("AiUsageEvent", aiUsageEventSchema);
