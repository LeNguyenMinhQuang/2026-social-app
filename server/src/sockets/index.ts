import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/generateTokens";
import { env } from "../config/env";
import { redisClient } from "../config/redis";
import { Message } from "../modules/chat/message.model";
import { Conversation } from "../modules/chat/conversation.model";
import { logger } from "../utils/logger";
let io: SocketIOServer;

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const PRESENCE_KEY_PREFIX = "presence:online:";

const setUserOnline = async (userId: string) => {
  // Đếm số socket đang mở của user này (dùng để xử lý đúng khi mở NHIỀU tab)
  await redisClient.incr(`${PRESENCE_KEY_PREFIX}${userId}`);
};

const setUserOffline = async (userId: string): Promise<boolean> => {
  const remaining = await redisClient.decr(`${PRESENCE_KEY_PREFIX}${userId}`);

  if (remaining <= 0) {
    await redisClient.del(`${PRESENCE_KEY_PREFIX}${userId}`);
    return true; // Thực sự offline (không còn tab nào mở)
  }

  return false; // Vẫn còn tab khác đang mở, chưa thực sự offline
};

export const isUserOnline = async (userId: string): Promise<boolean> => {
  const count = await redisClient.get(`${PRESENCE_KEY_PREFIX}${userId}`);
  return !!count && parseInt(count, 10) > 0;
};

export const initSocketServer = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      next(new Error("Thiếu access token"));
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Token không hợp lệ"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) return;

    socket.join(`user:${userId}`);

    setUserOnline(userId).then(() => {
      io.emit("presence:update", { userId, isOnline: true });
    });

    socket.on("message:send", async (payload: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = payload;

        if (!content?.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some((p) => p.toString() === userId);
        if (!isParticipant) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content: content.trim(),
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: { content: content.trim(), sender: userId, createdAt: message.createdAt },
        });

        conversation.participants.forEach((participantId) => {
          io.to(`user:${participantId.toString()}`).emit("message:new", {
            _id: message._id,
            conversation: conversationId,
            sender: userId,
            content: message.content,
            createdAt: message.createdAt,
          });
        });
      } catch (error) {
        logger.error({ err: error }, "Lỗi xử lý message:send");
      }
    });

    socket.on("typing:start", (payload: { conversationId: string; recipientId: string }) => {
      io.to(`user:${payload.recipientId}`).emit("typing:update", {
        conversationId: payload.conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (payload: { conversationId: string; recipientId: string }) => {
      io.to(`user:${payload.recipientId}`).emit("typing:update", {
        conversationId: payload.conversationId,
        userId,
        isTyping: false,
      });
    });

    socket.on("disconnect", () => {
      setUserOffline(userId).then((isNowOffline) => {
        if (isNowOffline) {
          io.emit("presence:update", { userId, isOnline: false });
        }
      });
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo");
  }
  return io;
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
