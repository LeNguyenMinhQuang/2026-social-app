import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerApi, loginApi, logoutApi } from "../../../api/auth.api";
import { useAuthStore } from "../store/authStore";
import type { RegisterFormValues, LoginFormValues } from "../schema/auth.schema";
import type { ApiErrorResponse } from "../../../types/user.types";
import { AxiosError } from "axios";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? "Đã có lỗi xảy ra";
  }
  return "Đã có lỗi xảy ra";
};

export const useRegister = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: Omit<RegisterFormValues, "confirmPassword">) => registerApi(input),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success("Đăng ký thành công!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: LoginFormValues) => loginApi(input),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      toast.success("Đã đăng xuất");
      navigate("/login");
    },
  });
};
