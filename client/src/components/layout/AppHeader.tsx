import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { NotificationBell } from "../../features/notification/components/NotificationBell";
import { useSocketConnection } from "../../features/notification/hooks/useSocketConnection";
import { useAuthStore } from "../../features/auth/store/authStore";

export function AppHeader() {
  useSocketConnection();

  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-mist/90 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        <Link to="/" className="font-display text-lg text-ink">
          Vòng Tròn
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/chat" className="text-ink/60 hover:text-ink">
            <MessageCircle size={20} />
          </Link>
          <NotificationBell />
          <Link
            to={`/profile/${user.username}`}
            className="h-8 w-8 overflow-hidden rounded-full bg-line"
          >
            {user.avatar && <img src={user.avatar} alt="" className="h-full w-full object-cover" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
