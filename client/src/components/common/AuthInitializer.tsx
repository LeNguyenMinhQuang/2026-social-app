import { useEffect, useState, type ReactNode } from "react";
import { refreshTokenApi, getMeApi } from "../../api/auth.api";
import { useAuthStore } from "../../features/auth/store/authStore";

interface AuthInitializerProps {
  children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken } = await refreshTokenApi();
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await getMeApi();
        useAuthStore.getState().setAuth(user, accessToken);
      } catch {
        useAuthStore.getState().clearAuth();
      } finally {
        setIsReady(true);
      }
    };

    restoreSession();
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <p className="font-sans text-sm text-ink/40">Đang tải...</p>
      </div>
    );
  }

  return <>{children}</>;
}
