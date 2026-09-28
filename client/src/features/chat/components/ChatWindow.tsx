import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { useMessages, useSendMessage, useTyping } from "../hooks/useChat";
import { useChatStore } from "../store/chatStore";
import { Button } from "../../../components/common/Button";

interface ChatWindowProps {
  conversationId: string;
  otherUserId: string;
  otherUsername: string;
}

const TYPING_DEBOUNCE_MS = 1500;

export function ChatWindow({ conversationId, otherUserId, otherUsername }: ChatWindowProps) {
  const [content, setContent] = useState("");
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data, fetchNextPage, hasNextPage } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const { startTyping, stopTyping } = useTyping();
  const typingUserId = useChatStore((state) => state.typingByConversation[conversationId] ?? null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping(conversationId, otherUserId);
    };
  }, [conversationId, otherUserId, stopTyping]);

  const handleContentChange = (value: string) => {
    setContent(value);

    startTyping(conversationId, otherUserId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId, otherUserId);
    }, TYPING_DEBOUNCE_MS);
  };

  const handleSend = () => {
    if (!content.trim()) return;
    sendMessage(conversationId, content);
    setContent("");
    stopTyping(conversationId, otherUserId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const isOtherUserTyping = typingUserId === otherUserId;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-4">
        <p className="font-sans text-sm font-semibold text-ink">{otherUsername}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="mb-3 w-full text-center font-sans text-xs text-ink/40 hover:text-coral"
          >
            Xem tin nhắn cũ hơn
          </button>
        )}

        <div className="flex flex-col gap-2">
          {messages.map((msg) => {
            const isMine = msg.sender === currentUserId;
            return (
              <div
                key={msg._id}
                className={`max-w-[70%] rounded-[12px] px-3.5 py-2 font-sans text-sm ${
                  isMine ? "self-end bg-ink text-white" : "self-start bg-line/40 text-ink"
                }`}
              >
                {msg.content}
              </div>
            );
          })}
        </div>

        {isOtherUserTyping && (
          <p className="mt-2 font-sans text-xs italic text-ink/40">Đang nhập...</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 border-t border-line p-3">
        <input
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhắn tin..."
          className="flex-1 border-0 border-b border-line bg-transparent py-2 font-sans text-sm text-ink outline-none placeholder:text-ink/30 focus:border-coral"
        />
        <Button className="w-auto px-4" onClick={handleSend}>
          Gửi
        </Button>
      </div>
    </div>
  );
}
