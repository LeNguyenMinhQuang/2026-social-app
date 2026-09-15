import { useAuthStore } from "../features/auth/store/authStore";
import { useLogout } from "../features/auth/hooks/useAuth";
import { Button } from "../components/common/Button";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-3xl text-ink">Chào, {user?.username} 👋</h1>
        <p className="mt-2 font-sans text-sm text-ink/50">Feed sẽ được code ở Giai đoạn 3.</p>
        <div className="mt-6">
          <Button onClick={() => logout()} isLoading={isPending}>
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
