import { create } from "zustand";

interface ChatState {
  onlineUsers: Set<string>;
  typingByConversation: Record<string, string | null>; // conversationId -> userId đang gõ (hoặc null)
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setTyping: (conversationId: string, userId: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  onlineUsers: new Set(),
  typingByConversation: {},
  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      if (isOnline) next.add(userId);
      else next.delete(userId);
      return { onlineUsers: next };
    }),
  setTyping: (conversationId, userId) =>
    set((state) => ({
      typingByConversation: { ...state.typingByConversation, [conversationId]: userId },
    })),
}));
