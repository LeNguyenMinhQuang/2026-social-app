import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validation";
import {
  registerUser,
  loginUser,
  rotateRefreshToken,
  logoutUser,
  TokenTheftError,
} from "./auth.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { env } from "../../config/env";
import { User } from "../user/user.model";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
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

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken as string | undefined;
  await logoutUser(token);
  res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
  return sendSuccess(res, 200, "Đăng xuất thành công");
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken as string | undefined;

  if (!token) {
    return sendError(res, 401, "Không tìm thấy refresh token");
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(token);
    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    return sendSuccess(res, 200, "Làm mới token thành công", { accessToken });
  } catch (error) {
    res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);

    if (error instanceof TokenTheftError) {
      return sendError(res, 401, error.message);
    }

    const message = error instanceof Error ? error.message : "Làm mới token thất bại";
    return sendError(res, 401, message);
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return sendError(res, 404, "Không tìm thấy người dùng");
  }

  return sendSuccess(res, 200, "OK", {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  });
};
