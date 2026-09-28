import { Types } from "mongoose";
import { Comment } from "./comment.model";
import { Post } from "./post.model";
import { encodeCursor, decodeCursor } from "../../utils/cursor";
import { createNotification } from "../notification/notification.service";

const COMMENT_PAGE_SIZE = 20;

export const createComment = async (postId: string, authorId: Types.ObjectId, content: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error("Không tìm thấy bài viết");
  }

  const comment = await Comment.create({ post: postId, author: authorId, content });
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  await createNotification({
    recipientId: post.author,
    senderId: authorId,
    type: "comment",
    postId: post._id,
  });

  return comment.populate("author", "username avatar");
};

export const deleteComment = async (commentId: string, requesterId: Types.ObjectId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Không tìm thấy bình luận");
  }

  if (!comment.author.equals(requesterId)) {
    throw new Error("Bạn không có quyền xóa bình luận này");
  }

  await comment.deleteOne();
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
};

export const getCommentsByPost = async (postId: string, cursor?: string) => {
  const query: Record<string, unknown> = { post: postId };

  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    query.$or = [
      { createdAt: { $lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), _id: { $lt: new Types.ObjectId(id) } },
    ];
  }

  const comments = await Comment.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(COMMENT_PAGE_SIZE + 1)
    .populate("author", "username avatar")
    .lean();

  const hasMore = comments.length > COMMENT_PAGE_SIZE;
  const items = hasMore ? comments.slice(0, COMMENT_PAGE_SIZE) : comments;
  const lastItem = items[items.length - 1];

  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem._id.toString()) : null;

  return { comments: items, nextCursor };
};
