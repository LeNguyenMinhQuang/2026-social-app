import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { User } from "./user.model";
import bcrypt from "bcrypt";

const USER_A = { username: "usera", email: "usera@example.com", password: "Password123" };
const USER_B = { username: "userb", email: "userb@example.com", password: "Password123" };

const createUser = async (input: typeof USER_A) => {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  return User.create({ ...input, password: hashedPassword });
};

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.data.accessToken as string;
};

describe("GET /api/users/:username", () => {
  beforeEach(async () => {
    await createUser(USER_A);
  });

  it("xem được profile public, không cần token", async () => {
    const res = await request(app).get(`/api/users/${USER_A.username}`);

    expect(res.status).toBe(200);
    expect(res.body.data.profile.username).toBe(USER_A.username);
    expect(res.body.data.profile.isFollowing).toBe(false);
  });

  it("trả 404 khi username không tồn tại", async () => {
    const res = await request(app).get("/api/users/khong-ton-tai");
    expect(res.status).toBe(404);
  });

  it("trả isFollowing đúng khi đã đăng nhập và đã follow trước đó", async () => {
    await createUser(USER_B);
    const tokenB = await loginAndGetToken(USER_B.email, USER_B.password);

    await request(app)
      .post(`/api/users/${USER_A.username}/follow`)
      .set("Authorization", `Bearer ${tokenB}`);

    const res = await request(app)
      .get(`/api/users/${USER_A.username}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.body.data.profile.isFollowing).toBe(true);
  });
});

describe("PATCH /api/users/me", () => {
  let token: string;

  beforeEach(async () => {
    await createUser(USER_A);
    token = await loginAndGetToken(USER_A.email, USER_A.password);
  });

  it("từ chối khi chưa đăng nhập", async () => {
    const res = await request(app).patch("/api/users/me").send({ bio: "test" });
    expect(res.status).toBe(401);
  });

  it("cập nhật bio thành công", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "Bio mới" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.bio).toBe("Bio mới");
  });

  it("từ chối khi đổi username trùng với user khác đã tồn tại", async () => {
    await createUser(USER_B);

    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: USER_B.username });

    expect(res.status).toBe(400);
  });

  it("cho phép giữ nguyên username hiện tại của chính mình (không báo lỗi trùng nhầm)", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: USER_A.username, bio: "Không đổi username" });

    expect(res.status).toBe(200);
  });
});

describe("POST & DELETE /api/users/:username/follow", () => {
  let tokenB: string;

  beforeEach(async () => {
    await createUser(USER_A);
    await createUser(USER_B);
    tokenB = await loginAndGetToken(USER_B.email, USER_B.password);
  });

  it("follow thành công, followersCount tăng đúng", async () => {
    const followRes = await request(app)
      .post(`/api/users/${USER_A.username}/follow`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(followRes.status).toBe(200);
    expect(followRes.body.data.isFollowing).toBe(true);

    const profileRes = await request(app).get(`/api/users/${USER_A.username}`);
    expect(profileRes.body.data.profile.followersCount).toBe(1);
  });

  it("từ chối follow chính mình", async () => {
    const res = await request(app)
      .post(`/api/users/${USER_B.username}/follow`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("chính mình");
  });

  it("từ chối follow 2 lần liên tiếp", async () => {
    await request(app)
      .post(`/api/users/${USER_A.username}/follow`)
      .set("Authorization", `Bearer ${tokenB}`);

    const res = await request(app)
      .post(`/api/users/${USER_A.username}/follow`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(400);
  });

  it("unfollow thành công, followersCount giảm đúng", async () => {
    await request(app)
      .post(`/api/users/${USER_A.username}/follow`)
      .set("Authorization", `Bearer ${tokenB}`);

    const unfollowRes = await request(app)
      .delete(`/api/users/${USER_A.username}/follow`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(unfollowRes.status).toBe(200);
    expect(unfollowRes.body.data.isFollowing).toBe(false);

    const profileRes = await request(app).get(`/api/users/${USER_A.username}`);
    expect(profileRes.body.data.profile.followersCount).toBe(0);
  });
});
