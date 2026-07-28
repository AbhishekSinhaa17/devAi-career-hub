import mongoose, { Document, Schema } from "mongoose";

export interface IAdminAuditLog extends Document {
  adminId?: mongoose.Types.ObjectId;
  action: string;
  targetId?: mongoose.Types.ObjectId | string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const adminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    targetId: { type: Schema.Types.Mixed }, // Mixed because it could point to any collection or be a string
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const AdminAuditLog = mongoose.model<IAdminAuditLog>("AdminAuditLog", adminAuditLogSchema);
