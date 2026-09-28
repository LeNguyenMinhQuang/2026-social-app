import { Request, Response } from "express";
import { Types } from "mongoose";
import { createPostSchema } from "./post.validation";
import { createPost, deletePost, toggleLike } from "./post.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getFeed } from "./post.service";

export const create = async (req: Request, res: Response) => {
  const parsed = createPostSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const imageBuffers = files.map((file) => file.buffer);

  try {
    const post = await createPost(req.userId as Types.ObjectId, parsed.data, imageBuffers);
    return sendSuccess(res, 201, "Đăng bài thành công", { post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đăng bài thất bại";
    return sendError(res, 400, message);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await deletePost(req.params.postId as string, req.userId as Types.ObjectId);
    return sendSuccess(res, 200, "Đã xóa bài viết");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xóa thất bại";
    return sendError(res, 400, message);
  }
};

export const like = async (req: Request, res: Response) => {
  try {
    const result = await toggleLike(req.params.postId as string, req.userId as Types.ObjectId);
    return sendSuccess(res, 200, result.liked ? "Đã thích" : "Đã bỏ thích", result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};

export const feed = async (req: Request, res: Response) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const result = await getFeed(req.userId as Types.ObjectId, cursor);
    return sendSuccess(res, 200, "OK", result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};
