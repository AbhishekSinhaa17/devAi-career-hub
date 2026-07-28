import mongoose, { Document, Schema } from "mongoose";

export interface ICopilotMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const copilotMessageSchema = new Schema<ICopilotMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "CopilotConversation", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const CopilotMessage = mongoose.model<ICopilotMessage>("CopilotMessage", copilotMessageSchema);
