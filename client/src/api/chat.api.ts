import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/user.types";
import type { Conversation, MessagesResponse } from "../types/chat.types";

export const getConversationsApi = async (): Promise<Conversation[]> => {
  const { data } =
    await axiosClient.get<ApiResponse<{ conversations: Conversation[] }>>("/conversations");
  return data.data.conversations;
};

export const startConversationApi = async (username: string): Promise<Conversation> => {
  const { data } = await axiosClient.post<ApiResponse<{ conversation: Conversation }>>(
    `/conversations/with/${username}`
  );
  return data.data.conversation;
};

export const getMessagesApi = async (
  conversationId: string,
  cursor?: string
): Promise<MessagesResponse> => {
  const { data } = await axiosClient.get<ApiResponse<MessagesResponse>>(
    `/conversations/${conversationId}/messages`,
    { params: cursor ? { cursor } : undefined }
  );
  return data.data;
};
