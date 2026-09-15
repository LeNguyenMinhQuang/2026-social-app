import { axiosClient } from "./axiosClient";
import type { ApiResponse, AuthResponse } from "../types/user.types";
import type { LoginFormValues, RegisterFormValues } from "../features/auth/schema/auth.schema";

export const registerApi = async (input: Omit<RegisterFormValues, "confirmPassword">) => {
  const { data } = await axiosClient.post<ApiResponse<AuthResponse>>("/auth/register", input);
  return data.data;
};

export const loginApi = async (input: LoginFormValues) => {
  const { data } = await axiosClient.post<ApiResponse<AuthResponse>>("/auth/login", input);
  return data.data;
};

export const logoutApi = async () => {
  await axiosClient.post("/auth/logout");
};

export const refreshTokenApi = async () => {
  const { data } =
    await axiosClient.post<ApiResponse<{ accessToken: string }>>("/auth/refresh-token");
  return data.data;
};
