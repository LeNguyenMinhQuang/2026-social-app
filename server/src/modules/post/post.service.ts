import { Types } from "mongoose";
import { Post } from "./post.model";
import { User } from "../user/user.model";
import { CreatePostInput } from "./post.validation";
import { uploadImageBuffer } from "../../utils/uploadToCloudinary";
import { encodeCursor, decodeCursor } from "../../utils/cursor";
import { createNotification } from "../notification/notification.service";

export const createPost = async (
  authorId: Types.ObjectId,
  input: CreatePostInput,
  imageBuffers: Buffer[]
) => {
  const hasContent = (input.content?.trim().length ?? 0) > 0;
  const hasImages = imageBuffers.length > 0;

  if (!hasContent && !hasImages) {
    throw new Error("Bài viết cần có nội dung hoặc ít nhất 1 ảnh");
  }

  const uploadResults = await Promise.all(
    imageBuffers.map((buffer) => uploadImageBuffer(buffer, "posts"))
  );
  const imageUrls = uploadResults.map((result) => result.secure_url);

  const post = await Post.create({
    author: authorId,
    content: input.content ?? "",
    images: imageUrls,
  });

  const populated = await post.populate("author", "username avatar");

  return populated;
};

export const deletePost = async (postId: string, requesterId: Types.ObjectId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error("Không tìm thấy bài viết");
  }

  if (!post.author.equals(requesterId)) {
    throw new Error("Bạn không có quyền xóa bài viết này");
  }

  await post.deleteOne();
};

export const toggleLike = async (postId: string, userId: Types.ObjectId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error("Không tìm thấy bài viết");
  }

  const alreadyLiked = post.likes.some((id) => id.equals(userId));

  const updateOperator = alreadyLiked
    ? { $pull: { likes: userId } }
    : { $addToSet: { likes: userId } };

  const updated = await Post.findByIdAndUpdate(postId, updateOperator, { returnDocument: "after" });

  if (!updated) {
    throw new Error("Không tìm thấy bài viết");
  }

  if (!alreadyLiked) {
    await createNotification({
      recipientId: updated.author,
      senderId: userId,
      type: "like",
      postId: updated._id,
    });
  }

  return { liked: !alreadyLiked, likesCount: updated.likes.length };
};

const FEED_PAGE_SIZE = 10;

export const getFeed = async (viewerId: Types.ObjectId, cursor?: string) => {
  const viewer = await User.findById(viewerId).select("following");

  if (!viewer) {
    throw new Error("Người dùng không tồn tại");
  }

  const authorIds = [...viewer.following, viewerId];

  const query: Record<string, unknown> = { author: { $in: authorIds } };

  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    query.$or = [
      { createdAt: { $lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), _id: { $lt: new Types.ObjectId(id) } },
    ];
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(FEED_PAGE_SIZE + 1)
    .populate("author", "username avatar")
    .lean();

  const hasMore = posts.length > FEED_PAGE_SIZE;
  const items = hasMore ? posts.slice(0, FEED_PAGE_SIZE) : posts;
  const lastItem = items[items.length - 1];

  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem._id.toString()) : null;

  const formatted = items.map((post) => ({
    id: post._id,
    author: post.author,
    content: post.content,
    images: post.images,
    likesCount: post.likes.length,
    isLiked: post.likes.some((id) => id.equals(viewerId)),
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
  }));

  return { posts: formatted, nextCursor };
};
