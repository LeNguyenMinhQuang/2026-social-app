import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { redisClient } from "../config/redis";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }

  const keys = await redisClient.keys("auth:refresh:*");
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await redisClient.quit();
  await mongoServer.stop();
});
