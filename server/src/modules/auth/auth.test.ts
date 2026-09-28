import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { User } from "../user/user.model";
import bcrypt from "bcrypt";

const VALID_USER = {
  username: "testuser",
  email: "test@example.com",
  password: "Password123",
};

describe("POST /api/auth/register", () => {
  it("đăng ký thành công với dữ liệu hợp lệ", async () => {
    const res = await request(app).post("/api/auth/register").send(VALID_USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(VALID_USER.email);
    expect(res.body.data.accessToken).toBeDefined();
    // password không được lộ ra response
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("từ chối khi email đã tồn tại", async () => {
    await request(app).post("/api/auth/register").send(VALID_USER);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...VALID_USER, username: "otheruser" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Email");
  });

  it("từ chối khi username đã tồn tại", async () => {
    await request(app).post("/api/auth/register").send(VALID_USER);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...VALID_USER, email: "other@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Username");
  });

  it("từ chối khi password quá ngắn", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...VALID_USER, password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("từ chối khi email sai định dạng", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...VALID_USER, email: "not-an-email" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(VALID_USER.password, 10);
    await User.create({ ...VALID_USER, password: hashedPassword });
  });

  it("đăng nhập thành công với đúng thông tin", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: VALID_USER.email, password: VALID_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    // Kiểm tra cookie refreshToken có được set không
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("từ chối khi sai password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: VALID_USER.email, password: "WrongPassword123" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("từ chối khi email không tồn tại", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notexist@example.com", password: "Password123" });

    expect(res.status).toBe(401);
  });

  it("trả cùng 1 message chung cho sai email và sai password (chống user enumeration)", async () => {
    const resWrongEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "notexist@example.com", password: "Password123" });

    const resWrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: VALID_USER.email, password: "WrongPassword123" });

    expect(resWrongEmail.body.message).toBe(resWrongPassword.body.message);
  });
});

describe("GET /api/auth/me (route cần đăng nhập)", () => {
  it("từ chối khi không có token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("từ chối khi token không hợp lệ", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer token-rac");
    expect(res.status).toBe(401);
  });

  it("cho phép truy cập và trả đúng thông tin user khi token hợp lệ", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(VALID_USER);
    const accessToken = registerRes.body.data.accessToken;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(VALID_USER.email);
  });
});

describe("POST /api/auth/refresh-token", () => {
  it("từ chối khi không có cookie refreshToken", async () => {
    const res = await request(app).post("/api/auth/refresh-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("refresh token");
  });

  it("cấp accessToken + refreshToken MỚI khi cookie hợp lệ", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(VALID_USER);
    const cookies = registerRes.headers["set-cookie"];

    expect(cookies).toBeDefined();

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", cookies as unknown as string[]);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("phát hiện đánh cắp: tái sử dụng refreshToken cũ sau khi đã rotate -> thu hồi cả family", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(VALID_USER);
    const oldCookies = registerRes.headers["set-cookie"] as unknown as string[];

    // Lần refresh đầu tiên bằng cookie gốc — hợp lệ, kích hoạt rotation
    const firstRefresh = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", oldCookies);

    expect(firstRefresh.status).toBe(200);

    // Dùng LẠI cookie CŨ (đã bị thay thế) — mô phỏng kẻ tấn công dùng token đánh cắp
    const reuseOldCookie = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", oldCookies);

    expect(reuseOldCookie.status).toBe(401);

    // Vì family đã bị thu hồi, kể cả cookie MỚI (hợp lệ, thuộc user thật) từ lần rotate đầu
    // cũng không dùng được nữa — đây chính là hệ quả bảo vệ của theft detection
    const newCookies = firstRefresh.headers["set-cookie"] as unknown as string[];
    const useNewCookieAfterRevoke = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", newCookies);

    expect(useNewCookieAfterRevoke.status).toBe(401);
  });
});
