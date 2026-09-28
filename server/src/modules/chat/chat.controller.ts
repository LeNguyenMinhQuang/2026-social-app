import { Request, Response } from "express";
import { Types } from "mongoose";
import { findOrCreateConversation, listConversations, getMessages } from "./chat.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const startConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await findOrCreateConversation(
      req.userId as Types.ObjectId,
      req.params.username as string
    );
    return sendSuccess(res, 200, "OK", { conversation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};

export const getConversations = async (req: Request, res: Response) => {
  const conversations = await listConversations(req.userId as Types.ObjectId);
  return sendSuccess(res, 200, "OK", { conversations });
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const result = await getMessages(
      req.params.conversationId as string,
      req.userId as Types.ObjectId,
      cursor
    );
    return sendSuccess(res, 200, "OK", result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thất bại";
    return sendError(res, 400, message);
  }
};
