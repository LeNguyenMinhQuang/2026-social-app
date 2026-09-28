import { Request, Response } from "express";
import { Types } from "mongoose";
import { createCommentSchema } from "./comment.validation";
import { createComment, deleteComment, getCommentsByPost } from "./comment.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const create = async (req: Request, res: Response) => {
  const parsed = createCommentSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }

  try {
    const comment = await createComment(
      req.params.postId as string,
      req.userId as Types.ObjectId,
      parsed.data.content
    );
    return sendSuccess(res, 201, "Đã bình luận", { comment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await deleteComment(req.params.commentId as string, req.userId as Types.ObjectId);
    return sendSuccess(res, 200, "Đã xóa bình luận");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};

export const list = async (req: Request, res: Response) => {
  const cursor = req.query.cursor as string | undefined;
  const result = await getCommentsByPost(req.params.postId as string, cursor);
  return sendSuccess(res, 200, "OK", result);
};
