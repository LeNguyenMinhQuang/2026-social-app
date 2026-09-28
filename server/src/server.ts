import { createServer } from "node:http";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initSocketServer } from "./sockets";
import "./config/redis";
import { logger } from "./utils/logger";

const startServer = async () => {
  await connectDB();

  const httpServer = createServer(app);
  initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
};

startServer();
