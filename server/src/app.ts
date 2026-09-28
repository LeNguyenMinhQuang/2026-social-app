import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import postRoutes from "./modules/post/post.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import chatRoutes from "./modules/chat/chat.routes";
import { pinoHttp } from "pino-http";
import { logger } from "./utils/logger";

const app = express();

app.use(helmet());
app.use(
  pinoHttp({
    logger,
    redact: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
  })
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", chatRoutes);

export default app;
