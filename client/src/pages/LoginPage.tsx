import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginForm } from "../features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
