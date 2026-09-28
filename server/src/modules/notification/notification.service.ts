import { Types } from "mongoose";
import { Notification, NotificationType } from "./notification.model";
import { emitToUser } from "../../sockets";
import { logger } from "../../utils/logger";

interface CreateNotificationInput {
  recipientId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: NotificationType;
  postId?: Types.ObjectId;
}

export const createNotification = async ({
  recipientId,
  senderId,
  type,
  postId,
}: CreateNotificationInput) => {
  if (recipientId.equals(senderId)) return;

  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
    });

    const populated = await notification.populate("sender", "username avatar");
    emitToUser(recipientId.toString(), "notification:new", populated);
  } catch (error) {
    logger.error({ err: error }, "Không thể tạo notification");
  }
};

export const getNotifications = async (userId: Types.ObjectId) => {
  return Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("sender", "username avatar")
    .lean();
};

export const markAllAsRead = async (userId: Types.ObjectId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

export const getUnreadCount = async (userId: Types.ObjectId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};
