import { Request, Response } from "express";
import { Types } from "mongoose";
import { updateProfileSchema } from "./user.validation";
import {
  getProfileByUsername,
  updateProfile,
  updateAvatar,
  followUser,
  unfollowUser,
} from "./user.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await getProfileByUsername(req.params.username as string, req.userId);
    return sendSuccess(res, 200, "OK", { profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không tìm thấy người dùng";
    return sendError(res, 404, message);
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }

  try {
    const user = await updateProfile(req.userId as Types.ObjectId, parsed.data);
    return sendSuccess(res, 200, "Cập nhật thành công", { user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cập nhật thất bại";
    return sendError(res, 400, message);
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 400, "Chưa chọn ảnh");
  }

  try {
    const result = await updateAvatar(req.userId as Types.ObjectId, req.file.buffer);
    return sendSuccess(res, 200, "Cập nhật avatar thành công", result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload thất bại";
    return sendError(res, 400, message);
  }
};

export const follow = async (req: Request, res: Response) => {
  try {
    const result = await followUser(req.userId as Types.ObjectId, req.params.username as string);
    return sendSuccess(res, 200, "Đã follow", result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};

export const unfollow = async (req: Request, res: Response) => {
  try {
    const result = await unfollowUser(req.userId as Types.ObjectId, req.params.username as string);
    return sendSuccess(res, 200, "Đã unfollow", result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};
