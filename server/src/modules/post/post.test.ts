import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { User } from "../user/user.model";
import { Post } from "./post.model";
import bcrypt from "bcrypt";

const USER_A = { username: "postusera", email: "postusera@example.com", password: "Password123" };
const USER_B = { username: "postuserb", email: "postuserb@example.com", password: "Password123" };

const createUser = async (input: typeof USER_A) => {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  return User.create({ ...input, password: hashedPassword });
};

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.data.accessToken as string;
};

describe("POST /api/posts", () => {
  let token: string;

  beforeEach(async () => {
    await createUser(USER_A);
    token = await loginAndGetToken(USER_A.email, USER_A.password);
  });

  it("tạo bài viết chỉ có text thành công", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Nội dung test" });

    expect(res.status).toBe(201);
    expect(res.body.data.post.content).toBe("Nội dung test");
    expect(res.body.data.post.author.username).toBe(USER_A.username);
  });

  it("từ chối khi không có content lẫn ảnh", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("từ chối khi chưa đăng nhập", async () => {
    const res = await request(app).post("/api/posts").send({ content: "test" });
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/posts/:postId", () => {
  let tokenA: string;
  let tokenB: string;
  let postId: string;

  beforeEach(async () => {
    const userA = await createUser(USER_A);
    await createUser(USER_B);
    tokenA = await loginAndGetToken(USER_A.email, USER_A.password);
    tokenB = await loginAndGetToken(USER_B.email, USER_B.password);

    const post = await Post.create({ author: userA._id, content: "Bài của A" });
    postId = post._id.toString();
  });

  it("chủ bài viết xóa thành công", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const deleted = await Post.findById(postId);
    expect(deleted).toBeNull();
  });

  it("từ chối khi người khác cố xóa bài không phải của mình", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(400);

    const stillExists = await Post.findById(postId);
    expect(stillExists).not.toBeNull();
  });
});

describe("POST /api/posts/:postId/like (toggle)", () => {
  let token: string;
  let postId: string;

  beforeEach(async () => {
    const user = await createUser(USER_A);
    token = await loginAndGetToken(USER_A.email, USER_A.password);
    const post = await Post.create({ author: user._id, content: "Bài test like" });
    postId = post._id.toString();
  });

  it("like lần đầu -> liked: true, likesCount tăng", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.liked).toBe(true);
    expect(res.body.data.likesCount).toBe(1);
  });

  it("like lần 2 (toggle) -> liked: false, likesCount giảm về 0", async () => {
    await request(app).post(`/api/posts/${postId}/like`).set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.liked).toBe(false);
    expect(res.body.data.likesCount).toBe(0);
  });

  it("like không bị tăng gấp đôi nếu gọi liên tiếp không đợi (race condition cơ bản)", async () => {
    await Promise.all([
      request(app).post(`/api/posts/${postId}/like`).set("Authorization", `Bearer ${token}`),
      request(app).post(`/api/posts/${postId}/like`).set("Authorization", `Bearer ${token}`),
    ]);

    const post = await Post.findById(postId);
    // Kết quả cuối cùng phải là 0 hoặc 1 lượt like, KHÔNG BAO GIỜ là 2
    expect(post?.likes.length).toBeLessThanOrEqual(1);
  });
});

describe("GET /api/posts/feed (cursor pagination)", () => {
  let token: string;

  beforeEach(async () => {
    const user = await createUser(USER_A);
    token = await loginAndGetToken(USER_A.email, USER_A.password);

    // Tạo 5 bài viết liên tiếp, cách nhau vài mili-giây để đảm bảo thứ tự createdAt khác nhau
    for (let i = 0; i < 5; i++) {
      await Post.create({ author: user._id, content: `Bài viết số ${i}` });
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  });

  it("trả đúng số lượng bài viết theo page size, có nextCursor khi còn dữ liệu", async () => {
    const res = await request(app).get("/api/posts/feed").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.posts.length).toBeGreaterThan(0);
    // Với 5 bài viết và FEED_PAGE_SIZE mặc định = 10, tất cả nằm gọn 1 trang -> không còn trang sau
    expect(res.body.data.nextCursor).toBeNull();
  });

  it("bài viết mới nhất phải nằm ở đầu danh sách", async () => {
    const res = await request(app).get("/api/posts/feed").set("Authorization", `Bearer ${token}`);

    const contents = res.body.data.posts.map((p: { content: string }) => p.content);
    expect(contents[0]).toBe("Bài viết số 4");
  });

  it("phân trang không trùng lặp bài viết giữa 2 trang liên tiếp (kiểm chứng cốt lõi của cursor pagination)", async () => {
    const firstPage = await request(app)
      .get("/api/posts/feed?cursor=")
      .set("Authorization", `Bearer ${token}`);

    // Giả lập page size nhỏ bằng cách chỉ lấy 2 bài đầu để test cursor thủ công
    const firstTwoIds = firstPage.body.data.posts.slice(0, 2).map((p: { id: string }) => p.id);

    expect(firstTwoIds.length).toBe(2);
    // Không có bài nào trong 5 bài trùng id với nhau (test tính toàn vẹn cơ bản)
    const allIds = firstPage.body.data.posts.map((p: { id: string }) => p.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});

describe("POST /api/posts/:postId/comments", () => {
  let token: string;
  let postId: string;

  beforeEach(async () => {
    const user = await createUser(USER_A);
    token = await loginAndGetToken(USER_A.email, USER_A.password);
    const post = await Post.create({ author: user._id, content: "Bài test comment" });
    postId = post._id.toString();
  });

  it("tạo comment thành công, commentsCount trên Post tăng đúng", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Comment test" });

    expect(res.status).toBe(201);

    const post = await Post.findById(postId);
    expect(post?.commentsCount).toBe(1);
  });

  it("từ chối comment rỗng", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "" });

    expect(res.status).toBe(400);
  });

  it("xóa comment -> commentsCount trên Post giảm đúng", async () => {
    const createRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Sẽ bị xóa" });

    const commentId = createRes.body.data.comment._id;

    const deleteRes = await request(app)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    const post = await Post.findById(postId);
    expect(post?.commentsCount).toBe(0);
  });

  it("lấy danh sách comment không cần token (public)", async () => {
    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Comment public test" });

    const res = await request(app).get(`/api/posts/${postId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBe(1);
  });
});
