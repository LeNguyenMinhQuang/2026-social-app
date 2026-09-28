import { Types } from "mongoose";
import { Conversation } from "./conversation.model";
import { Message } from "./message.model";
import { encodeCursor, decodeCursor } from "../../utils/cursor";

const MESSAGE_PAGE_SIZE = 30;

export const findOrCreateConversation = async (userId: Types.ObjectId, otherUsername: string) => {
  const { User } = await import("../user/user.model");
  const otherUser = await User.findOne({ username: otherUsername });

  if (!otherUser) {
    throw new Error("Không tìm thấy người dùng");
  }

  if (otherUser._id.equals(userId)) {
    throw new Error("Không thể tự nhắn tin cho chính mình");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, otherUser._id], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, otherUser._id],
      lastMessage: null,
    });
  }

  const populated = await conversation.populate<{
    participants: { _id: Types.ObjectId; username: string; avatar: string }[];
  }>("participants", "username avatar");

  const otherParticipant = populated.participants.find((p) => !p._id.equals(userId));

  return {
    id: populated._id,
    otherUser: otherParticipant,
    lastMessage: populated.lastMessage,
    updatedAt: populated.updatedAt,
  };
};

export const listConversations = async (userId: Types.ObjectId) => {
  const conversations = await Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate("participants", "username avatar")
    .lean();

  return conversations.map((conv) => ({
    id: conv._id,
    otherUser: conv.participants.find(
      (p) => !(p as unknown as { _id: Types.ObjectId })._id.equals(userId)
    ),
    lastMessage: conv.lastMessage,
    updatedAt: conv.updatedAt,
  }));
};

export const getMessages = async (
  conversationId: string,
  userId: Types.ObjectId,
  cursor?: string
) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error("Không tìm thấy hội thoại");
  }

  const isParticipant = conversation.participants.some((p) => p.equals(userId));

  if (!isParticipant) {
    throw new Error("Bạn không có quyền xem hội thoại này");
  }

  const query: Record<string, unknown> = { conversation: conversationId };

  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    query.$or = [
      { createdAt: { $lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), _id: { $lt: new Types.ObjectId(id) } },
    ];
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(MESSAGE_PAGE_SIZE + 1)
    .lean();

  const hasMore = messages.length > MESSAGE_PAGE_SIZE;
  const items = hasMore ? messages.slice(0, MESSAGE_PAGE_SIZE) : messages;
  const lastItem = items[items.length - 1];

  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem._id.toString()) : null;

  return { messages: items.reverse(), nextCursor };
};
