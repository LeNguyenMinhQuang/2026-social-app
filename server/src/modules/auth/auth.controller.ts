import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validation";
import { registerUser, loginUser, refreshAccessToken } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { env } from "../../config/env";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (tính bằng milliseconds)
};

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }

  try {
    const { user, accessToken, refreshToken } = await registerUser(parsed.data);

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    return sendSuccess(res, 201, "Đăng ký thành công", { user, accessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đăng ký thất bại";
    return sendError(res, 400, message);
  }
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }

  try {
    const { user, accessToken, refreshToken } = await loginUser(parsed.data);

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    return sendSuccess(res, 200, "Đăng nhập thành công", { user, accessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
    return sendError(res, 401, message);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
  return sendSuccess(res, 200, "Đăng xuất thành công");
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken as string | undefined;

  if (!token) {
    return sendError(res, 401, "Không tìm thấy refresh token");
  }

  try {
    const { accessToken } = await refreshAccessToken(token);
    return sendSuccess(res, 200, "Làm mới token thành công", { accessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Làm mới token thất bại";
    return sendError(res, 401, message);
  }
};
