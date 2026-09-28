import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { User } from "../user/user.model";
import { Post } from "../post/post.model";
import bcrypt from "bcrypt";

const USER_A = { username: "notifusera", email: "notifusera@example.com", password: "Password123" };
const USER_B = { username: "notifuserb", email: "notifuserb@example.com", password: "Password123" };

const createUser = async (input: typeof USER_A) => {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  return User.create({ ...input, password: hashedPassword });
};

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.data.accessToken as string;
};

describe("Notification tạo tự động khi có tương tác", () => {
  let tokenA: string;
  let tokenB: string;
  let userB: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    await createUser(USER_A);
    userB = await createUser(USER_B);
    tokenA = await loginAndGetToken(USER_A.email, USER_A.password);
    tokenB = await loginAndGetToken(USER_B.email, USER_B.password);
  });

  it("follow tạo ra notification type=follow cho người được follow", async () => {
    await request(app)
      .post(`/api/users/${USER_B.username}/follow`)
      .set("Authorization", `Bearer ${tokenA}`);

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(1);
    expect(res.body.data.notifications[0].type).toBe("follow");
    expect(res.body.data.notifications[0].sender.username).toBe(USER_A.username);
  });

  it("like bài viết tạo ra notification type=like cho tác giả bài viết", async () => {
    const post = await Post.create({ author: userB._id, content: "Bài của B" });

    await request(app).post(`/api/posts/${post._id}/like`).set("Authorization", `Bearer ${tokenA}`);

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.body.data.notifications[0].type).toBe("like");
  });

  it("unlike KHÔNG tạo notification mới", async () => {
    const post = await Post.create({ author: userB._id, content: "Bài của B" });

    await request(app).post(`/api/posts/${post._id}/like`).set("Authorization", `Bearer ${tokenA}`);
    await request(app).post(`/api/posts/${post._id}/like`).set("Authorization", `Bearer ${tokenA}`); // unlike

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.body.data.notifications).toHaveLength(1); // chỉ 1 (từ lần like đầu), không phải 2
  });

  it("comment tạo ra notification type=comment", async () => {
    const post = await Post.create({ author: userB._id, content: "Bài của B" });

    await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ content: "Comment test" });

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.body.data.notifications[0].type).toBe("comment");
  });

  it("tự like bài viết của chính mình KHÔNG tạo notification (loại trừ self-notify)", async () => {
    const userA = await User.findOne({ username: USER_A.username });
    const post = await Post.create({ author: userA?._id, content: "Bài của A" });

    await request(app).post(`/api/posts/${post._id}/like`).set("Authorization", `Bearer ${tokenA}`);

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.body.data.notifications).toHaveLength(0);
  });
});

describe("GET/PATCH /api/notifications", () => {
  let tokenB: string;

  beforeEach(async () => {
    await createUser(USER_A);
    const userB2 = await createUser(USER_B);
    tokenB = await loginAndGetToken(USER_B.email, USER_B.password);

    const tokenA = await loginAndGetToken(USER_A.email, USER_A.password);
    await request(app)
      .post(`/api/users/${USER_B.username}/follow`)
      .set("Authorization", `Bearer ${tokenA}`);
    void userB2;
  });

  it("unread-count trả đúng số lượng ban đầu", async () => {
    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.body.data.count).toBe(1);
  });

  it("mark-read khiến unread-count về 0", async () => {
    await request(app)
      .patch("/api/notifications/mark-read")
      .set("Authorization", `Bearer ${tokenB}`);

    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.body.data.count).toBe(0);
  });

  it("từ chối khi chưa đăng nhập", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(401);
  });
});
