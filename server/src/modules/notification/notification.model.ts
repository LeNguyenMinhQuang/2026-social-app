import { Schema, model, Document, Types } from "mongoose";

export type NotificationType = "like" | "comment" | "follow";

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  post?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "follow"], required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
