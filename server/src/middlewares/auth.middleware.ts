import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateTokens";
import { sendError } from "../utils/apiResponse";
import { Types } from "mongoose";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, 401, "Chưa đăng nhập");
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    sendError(res, 401, "Token không hợp lệ");
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = new Types.ObjectId(decoded.userId);
    next();
  } catch {
    sendError(res, 401, "Token đã hết hạn hoặc không hợp lệ");
    return;
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        req.userId = new Types.ObjectId(decoded.userId);
      } catch {
        // Token sai/hết hạn -> coi như khách vãng lai, không chặn request
      }
    }
  }

  next();
};
