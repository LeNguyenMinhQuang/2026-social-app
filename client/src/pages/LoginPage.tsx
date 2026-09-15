import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginForm } from "../components/layout/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
