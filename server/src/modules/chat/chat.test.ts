import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { User } from "../user/user.model";
import { Conversation } from "./conversation.model";
import { Message } from "./message.model";
import bcrypt from "bcrypt";

const USER_A = { username: "chatusera", email: "chatusera@example.com", password: "Password123" };
const USER_B = { username: "chatuserb", email: "chatuserb@example.com", password: "Password123" };
const USER_C = { username: "chatuserc", email: "chatuserc@example.com", password: "Password123" };

const createUser = async (input: typeof USER_A) => {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  return User.create({ ...input, password: hashedPassword });
};

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.data.accessToken as string;
};

describe("POST /api/conversations/with/:username", () => {
  let tokenA: string;

  beforeEach(async () => {
    await createUser(USER_A);
    await createUser(USER_B);
    tokenA = await loginAndGetToken(USER_A.email, USER_A.password);
  });

  it("trả về conversation có field `id` (không phải `_id`) và `otherUser` đúng người", async () => {
    const res = await request(app)
      .post(`/api/conversations/with/${USER_B.username}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    // Khóa đúng lỗi "?conversation=undefined" ở frontend
    expect(res.body.data.conversation.id).toBeDefined();
    expect(res.body.data.conversation._id).toBeUndefined();
    expect(res.body.data.conversation.otherUser.username).toBe(USER_B.username);
  });

  it("gọi 2 lần với cùng 1 cặp user -> cùng 1 conversation, không tạo trùng", async () => {
    const first = await request(app)
      .post(`/api/conversations/with/${USER_B.username}`)
      .set("Authorization", `Bearer ${tokenA}`);
    const second = await request(app)
      .post(`/api/conversations/with/${USER_B.username}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(second.body.data.conversation.id).toBe(first.body.data.conversation.id);
    expect(await Conversation.countDocuments()).toBe(1);
  });

  it("A mở với B rồi B mở với A -> vẫn là cùng 1 conversation", async () => {
    const tokenB = await loginAndGetToken(USER_B.email, USER_B.password);

    const fromA = await request(app)
      .post(`/api/conversations/with/${USER_B.username}`)
      .set("Authorization", `Bearer ${tokenA}`);
    const fromB = await request(app)
      .post(`/api/conversations/with/${USER_A.username}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(fromB.body.data.conversation.id).toBe(fromA.body.data.conversation.id);
    expect(fromB.body.data.conversation.otherUser.username).toBe(USER_A.username);
  });

  it("từ chối nhắn tin cho chính mình", async () => {
    const res = await request(app)
      .post(`/api/conversations/with/${USER_A.username}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(400);
  });

  it("từ chối khi username không tồn tại", async () => {
    const res = await request(app)
      .post("/api/conversations/with/khong-ton-tai")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(400);
  });

  it("từ chối khi chưa đăng nhập", async () => {
    const res = await request(app).post(`/api/conversations/with/${USER_B.username}`);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/conversations", () => {
  it("chỉ trả về hội thoại của chính mình, có otherUser đúng và lastMessage", async () => {
    const userA = await createUser(USER_A);
    const userB = await createUser(USER_B);
    const userC = await createUser(USER_C);
    const tokenA = await loginAndGetToken(USER_A.email, USER_A.password);

    await Conversation.create({
      participants: [userA._id, userB._id],
      lastMessage: { content: "Xin chào B", sender: userA._id, createdAt: new Date() },
    });
    // Hội thoại giữa B và C — A không được thấy
    await Conversation.create({ participants: [userB._id, userC._id], lastMessage: null });

    const res = await request(app)
      .get("/api/conversations")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.conversations).toHaveLength(1);
    expect(res.body.data.conversations[0].otherUser.username).toBe(USER_B.username);
    expect(res.body.data.conversations[0].lastMessage.content).toBe("Xin chào B");
  });

  it("từ chối khi chưa đăng nhập", async () => {
    const res = await request(app).get("/api/conversations");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/conversations/:conversationId/messages", () => {
  let tokenA: string;
  let tokenC: string;
  let conversationId: string;
  let userAId: string;

  beforeEach(async () => {
    const userA = await createUser(USER_A);
    const userB = await createUser(USER_B);
    await createUser(USER_C);
    tokenA = await loginAndGetToken(USER_A.email, USER_A.password);
    tokenC = await loginAndGetToken(USER_C.email, USER_C.password);
    userAId = userA._id.toString();

    const conversation = await Conversation.create({
      participants: [userA._id, userB._id],
      lastMessage: null,
    });
    conversationId = conversation._id.toString();
  });

  it("thành viên xem được tin nhắn, thứ tự cũ -> mới (mới nhất nằm cuối)", async () => {
    for (let i = 1; i <= 3; i++) {
      await Message.create({ conversation: conversationId, sender: userAId, content: `Tin ${i}` });
    }

    const res = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const contents = res.body.data.messages.map((m: { content: string }) => m.content);
    expect(contents).toEqual(["Tin 1", "Tin 2", "Tin 3"]);
    expect(res.body.data.nextCursor).toBeNull();
  });

  it("người KHÔNG thuộc hội thoại bị từ chối (không đọc trộm được tin nhắn)", async () => {
    await Message.create({ conversation: conversationId, sender: userAId, content: "Riêng tư" });

    const res = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${tokenC}`);

    expect(res.status).toBe(400);
    expect(res.body.data).toBeUndefined();
  });

  it("phân trang cursor: 35 tin -> trang 1 có 30, trang 2 có 5, không trùng lặp", async () => {
    for (let i = 1; i <= 35; i++) {
      await Message.create({ conversation: conversationId, sender: userAId, content: `Tin ${i}` });
    }

    const page1 = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(page1.body.data.messages).toHaveLength(30);
    expect(page1.body.data.nextCursor).not.toBeNull();
    // Trang 1 là 30 tin MỚI nhất (6..35), hiển thị cũ -> mới
    expect(page1.body.data.messages[0].content).toBe("Tin 6");
    expect(page1.body.data.messages[29].content).toBe("Tin 35");

    const page2 = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .query({ cursor: page1.body.data.nextCursor })
      .set("Authorization", `Bearer ${tokenA}`);

    expect(page2.body.data.messages).toHaveLength(5);
    expect(page2.body.data.nextCursor).toBeNull();

    const allIds = [...page1.body.data.messages, ...page2.body.data.messages].map(
      (m: { _id: string }) => m._id
    );
    expect(new Set(allIds).size).toBe(35);
  });

  it("từ chối khi chưa đăng nhập", async () => {
    const res = await request(app).get(`/api/conversations/${conversationId}/messages`);
    expect(res.status).toBe(401);
  });
});
