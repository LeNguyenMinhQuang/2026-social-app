import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "../../features/auth/schema/auth.schema";
import { useRegister } from "../../features/auth/hooks/useAuth";
import { FormField } from "../common/FormField";
import { Button } from "../common/Button";

export function RegisterForm() {
  const { mutate, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutate({ username: data.username, email: data.email, password: data.password });
  };

  return (
    <div>
      <h2 className="font-display text-[28px] text-ink">Tạo tài khoản</h2>
      <p className="mt-2 font-sans text-sm text-ink/50">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-medium text-coral underline underline-offset-2">
          Đăng nhập
        </Link>
      </p>
      <div className="mt-6 border-t border-line" />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
        <FormField
          id="username"
          label="Username"
          placeholder="username"
          error={errors.username?.message}
          {...register("username")}
        />
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
        <FormField
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" isLoading={isPending} className="mt-2">
          Tạo tài khoản
        </Button>
      </form>
    </div>
  );
}
