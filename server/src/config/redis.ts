import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redisClient = new Redis(env.REDIS_URL);

redisClient.on("connect", () => logger.info("Redis connected"));

redisClient.on("error", (error) => logger.error({ err: error }, "Redis connection error"));
