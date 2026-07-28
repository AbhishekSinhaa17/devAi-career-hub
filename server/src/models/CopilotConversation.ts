import mongoose, { Document, Schema } from "mongoose";

export interface ICopilotConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  contextSnapshot: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const copilotConversationSchema = new Schema<ICopilotConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Career Discussion", required: true },
    contextSnapshot: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const CopilotConversation = mongoose.model<ICopilotConversation>("CopilotConversation", copilotConversationSchema);
