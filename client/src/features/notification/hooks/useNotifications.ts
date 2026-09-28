import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsApi,
  getUnreadCountApi,
  markAllReadApi,
} from "../../../api/notification.api";
import { useAuthStore } from "../../auth/store/authStore";

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotificationsApi,
    enabled: isAuthenticated,
  });
};

export const useUnreadCount = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCountApi,
    enabled: isAuthenticated,
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
