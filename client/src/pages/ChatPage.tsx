import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConversationList } from "../features/chat/components/ConversationList";
import { ChatWindow } from "../features/chat/components/ChatWindow";
import { useConversations } from "../features/chat/hooks/useChat";

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get("conversation");
  const [activeConv, setActiveConv] = useState<{ id: string; otherUserId: string } | null>(null);
  const { data: conversations } = useConversations();

  const active =
    activeConv ??
    (initialConvId
      ? (() => {
          const found = conversations?.find((c) => c.id === initialConvId);
          return found ? { id: found.id, otherUserId: found.otherUser._id } : null;
        })()
      : null);

  const activeConversation = conversations?.find((c) => c.id === active?.id);

  return (
    <div className="mx-auto flex h-[calc(100vh-56px)] max-w-4xl">
      <div className="w-80 shrink-0 overflow-y-auto border-r border-line">
        <ConversationList
          activeConversationId={active?.id ?? null}
          onSelect={(id, otherUserId) => setActiveConv({ id, otherUserId })}
        />
      </div>

      <div className="flex-1">
        {active && activeConversation ? (
          <ChatWindow
            conversationId={active.id}
            otherUserId={active.otherUserId}
            otherUsername={activeConversation.otherUser.username}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="font-sans text-sm text-ink/40">Chọn 1 hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
