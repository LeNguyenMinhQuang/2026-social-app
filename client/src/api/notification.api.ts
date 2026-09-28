import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/user.types";
import type { AuthorSummary } from "../types/user.types";

export interface Notification {
  _id: string;
  sender: AuthorSummary;
  type: "like" | "comment" | "follow";
  post?: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotificationsApi = async (): Promise<Notification[]> => {
  const { data } =
    await axiosClient.get<ApiResponse<{ notifications: Notification[] }>>("/notifications");
  return data.data.notifications;
};

export const getUnreadCountApi = async (): Promise<number> => {
  const { data } = await axiosClient.get<ApiResponse<{ count: number }>>(
    "/notifications/unread-count"
  );
  return data.data.count;
};

export const markAllReadApi = async (): Promise<void> => {
  await axiosClient.patch("/notifications/mark-read");
};
