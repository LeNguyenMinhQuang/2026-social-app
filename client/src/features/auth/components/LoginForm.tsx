import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { loginFormSchema, type LoginFormValues } from "../schema/auth.schema";
import { useLogin } from "../hooks/useAuth";
import { FormField } from "../../../components/common/FormField";
import { Button } from "../../../components/common/Button";

export function LoginForm() {
  const { mutate, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  return (
    <div>
      <h2 className="font-display text-[28px] text-ink">Đăng nhập</h2>
      <p className="mt-2 font-sans text-sm text-ink/50">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-medium text-coral underline underline-offset-2">
          Tạo tài khoản
        </Link>
      </p>
      <div className="mt-6 border-t border-line" />

      <form onSubmit={handleSubmit((data) => mutate(data))} className="mt-6 flex flex-col gap-5">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" isLoading={isPending} className="mt-2">
          Đăng nhập
        </Button>
      </form>
    </div>
  );
}
