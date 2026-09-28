import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { Types } from "mongoose";

interface AccessTokenPayload {
  userId: string;
}

interface RefreshTokenPayload {
  userId: string;
  familyId: string;
  jti: string;
}

export const generateAccessToken = (userId: Types.ObjectId): string => {
  const payload: AccessTokenPayload = { userId: userId.toString() };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (
  userId: Types.ObjectId,
  familyId: string,
  jti: string
): string => {
  const payload: RefreshTokenPayload = { userId: userId.toString(), familyId, jti };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};

export const createTokenFamily = (): string => randomUUID();
export const createTokenId = (): string => randomUUID();
