import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectSocket, disconnectSocket } from "../../../lib/socket";
import { useAuthStore } from "../../auth/store/authStore";
import { useChatStore } from "../../chat/store/chatStore";
import type { Message } from "../../../types/chat.types";

export const useSocketConnection = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast("Bạn có thông báo mới");
    };

    const handleNewMessage = (message: Message) => {
      queryClient.setQueryData(
        ["messages", message.conversation],
        (old: { pages: { messages: Message[]; nextCursor: string | null }[] } | undefined) => {
          if (!old) return old;
          const newPages = [...old.pages];
          const firstPage = newPages[0];
          if (firstPage) {
            newPages[0] = { ...firstPage, messages: [...firstPage.messages, message] };
          }
          return { ...old, pages: newPages };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handlePresenceUpdate = (payload: { userId: string; isOnline: boolean }) => {
      useChatStore.getState().setUserOnline(payload.userId, payload.isOnline);
    };

    const handleTypingUpdate = (payload: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      useChatStore
        .getState()
        .setTyping(payload.conversationId, payload.isTyping ? payload.userId : null);
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("message:new", handleNewMessage);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("connect_error", (err) => console.error("Socket connect error:", err.message));

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("message:new", handleNewMessage);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("typing:update", handleTypingUpdate);
    };
  }, [isAuthenticated, accessToken, queryClient]);
};
