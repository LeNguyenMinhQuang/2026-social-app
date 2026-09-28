import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { getConversationsApi, startConversationApi, getMessagesApi } from "../../../api/chat.api";
import { getSocket } from "../../../lib/socket";
import { useAuthStore } from "../../auth/store/authStore";
import type { MessagesResponse } from "../../../types/chat.types";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversationsApi,
  });
};

export const useStartConversation = () => {
  return useMutation({
    mutationFn: startConversationApi,
  });
};

export const useMessages = (conversationId: string) => {
  return useInfiniteQuery<MessagesResponse>({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) => getMessagesApi(conversationId, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const currentUserId = useAuthStore((state) => state.user?.id);

  return (conversationId: string, content: string) => {
    const socket = getSocket();
    if (!socket || !content.trim() || !currentUserId) return;

    socket.emit("message:send", { conversationId, content: content.trim() });
  };
};

export const useTyping = () => {
  return {
    startTyping: (conversationId: string, recipientId: string) => {
      getSocket()?.emit("typing:start", { conversationId, recipientId });
    },
    stopTyping: (conversationId: string, recipientId: string) => {
      getSocket()?.emit("typing:stop", { conversationId, recipientId });
    },
  };
};
