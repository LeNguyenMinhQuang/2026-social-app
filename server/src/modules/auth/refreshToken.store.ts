import { redisClient } from "../../config/redis";

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 ngày

interface StoredFamily {
  userId: string;
  jti: string;
}

const familyKey = (familyId: string) => `auth:refresh:${familyId}`;

export const saveTokenFamily = async (
  familyId: string,
  userId: string,
  jti: string
): Promise<void> => {
  const value: StoredFamily = { userId, jti };
  await redisClient.set(familyKey(familyId), JSON.stringify(value), "EX", REFRESH_TTL_SECONDS);
};

export const getTokenFamily = async (familyId: string): Promise<StoredFamily | null> => {
  const raw = await redisClient.get(familyKey(familyId));
  return raw ? (JSON.parse(raw) as StoredFamily) : null;
};

export const revokeTokenFamily = async (familyId: string): Promise<void> => {
  await redisClient.del(familyKey(familyId));
};
