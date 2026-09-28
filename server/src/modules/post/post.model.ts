import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  images: string[];
  likes: Types.ObjectId[];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    images: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index phục vụ truy vấn feed: lấy bài viết theo tác giả, sắp xếp mới nhất trước
postSchema.index({ author: 1, createdAt: -1 });

export const Post = model<IPost>("Post", postSchema);
