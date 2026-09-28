import { Schema, model, Document, Types } from "mongoose";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage: {
    content: string;
    sender: Types.ObjectId;
    createdAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: {
      content: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export const Conversation = model<IConversation>("Conversation", conversationSchema);
