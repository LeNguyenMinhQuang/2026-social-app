import { AuthLayout } from "../components/layout/AuthLayout";
import { RegisterForm } from "../components/layout/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
