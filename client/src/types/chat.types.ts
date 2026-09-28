import type { AuthorSummary } from "./user.types";

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUser: AuthorSummary;
  lastMessage: { content: string; sender: string; createdAt: string } | null;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}
