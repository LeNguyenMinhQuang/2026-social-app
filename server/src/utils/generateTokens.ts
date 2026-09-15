import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Types } from "mongoose";

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: Types.ObjectId): string => {
  const payload: TokenPayload = { userId: userId.toString() };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  const payload: TokenPayload = { userId: userId.toString() };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
};
