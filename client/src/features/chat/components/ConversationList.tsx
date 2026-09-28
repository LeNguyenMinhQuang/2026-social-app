import dayjs from "dayjs";
import { useConversations } from "../hooks/useChat";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../../auth/store/authStore";

interface ConversationListProps {
  activeConversationId: string | null;
  onSelect: (conversationId: string, otherUserId: string) => void;
}

export function ConversationList({ activeConversationId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading } = useConversations();
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const currentUserId = useAuthStore((state) => state.user?.id);

  if (isLoading) {
    return <p className="p-4 font-sans text-sm text-ink/40">Đang tải...</p>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <p className="p-4 font-sans text-sm text-ink/40">
        Chưa có hội thoại nào. Vào profile ai đó và bấm "Nhắn tin" để bắt đầu.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        const isOnline = onlineUsers.has(conv.otherUser._id);
        const isActive = conv.id === activeConversationId;
        const isLastMessageMine = conv.lastMessage?.sender === currentUserId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id, conv.otherUser._id)}
            className={`flex items-center gap-3 border-b border-line p-3 text-left hover:bg-line/20 ${
              isActive ? "bg-line/30" : ""
            }`}
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-line">
              {conv.otherUser.avatar && (
                <img src={conv.otherUser.avatar} alt="" className="h-full w-full object-cover" />
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-moss" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-semibold text-ink">{conv.otherUser.username}</p>
              <p className="truncate font-sans text-xs text-ink/50">
                {conv.lastMessage
                  ? `${isLastMessageMine ? "Bạn: " : ""}${conv.lastMessage.content}`
                  : "Bắt đầu trò chuyện"}
              </p>
            </div>

            {conv.lastMessage && (
              <span className="shrink-0 font-sans text-[11px] text-ink/30">
                {dayjs(conv.lastMessage.createdAt).fromNow()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
