import mongoose, { Document, Schema } from "mongoose";

export interface IOAuthExchangeCode extends Document {
  code: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const oauthExchangeCodeSchema = new Schema<IOAuthExchangeCode>(
  {
    code: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    used: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OAuthExchangeCode = mongoose.model<IOAuthExchangeCode>(
  "OAuthExchangeCode",
  oauthExchangeCodeSchema
);
