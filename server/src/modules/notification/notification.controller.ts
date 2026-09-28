import { Request, Response } from "express";
import { Types } from "mongoose";
import { getNotifications, markAllAsRead, getUnreadCount } from "./notification.service";
import { sendSuccess } from "../../utils/apiResponse";

export const list = async (req: Request, res: Response) => {
  const notifications = await getNotifications(req.userId as Types.ObjectId);
  return sendSuccess(res, 200, "OK", { notifications });
};

export const markRead = async (req: Request, res: Response) => {
  await markAllAsRead(req.userId as Types.ObjectId);
  return sendSuccess(res, 200, "Đã đánh dấu đã đọc");
};

export const unreadCount = async (req: Request, res: Response) => {
  const count = await getUnreadCount(req.userId as Types.ObjectId);
  return sendSuccess(res, 200, "OK", { count });
};
