import { useState } from "react";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import dayjs from "dayjs";
import { useNotifications, useUnreadCount, useMarkAllRead } from "../hooks/useNotifications";
import type { Notification } from "../../../api/notification.api";

const ICON_BY_TYPE: Record<Notification["type"], React.ReactNode> = {
  like: <Heart size={14} className="text-coral" fill="currentColor" />,
  comment: <MessageCircle size={14} className="text-moss" />,
  follow: <UserPlus size={14} className="text-ink" />,
};

const MESSAGE_BY_TYPE: Record<Notification["type"], string> = {
  like: "đã thích bài viết của bạn",
  comment: "đã bình luận bài viết của bạn",
  follow: "đã bắt đầu follow bạn",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const { mutate: markAllRead } = useMarkAllRead();

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount && unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <div className="relative">
      <button onClick={handleToggle} className="relative text-ink/60 hover:text-ink">
        <Bell size={20} />
        {!!unreadCount && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral font-sans text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-20 max-h-96 w-80 overflow-y-auto rounded-[10px] border border-line bg-white shadow-lg">
          {!notifications || notifications.length === 0 ? (
            <p className="p-4 text-center font-sans text-sm text-ink/40">Chưa có thông báo nào</p>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className="flex items-start gap-3 border-b border-line p-3">
                <div className="mt-0.5">{ICON_BY_TYPE[n.type]}</div>
                <div>
                  <p className="font-sans text-sm text-ink">
                    <span className="font-semibold">{n.sender.username}</span>{" "}
                    {MESSAGE_BY_TYPE[n.type]}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-ink/40">
                    {dayjs(n.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
