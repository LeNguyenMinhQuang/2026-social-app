import { z } from "zod";

export const createPostSchema = z
  .object({
    content: z.string().max(2000, "Nội dung tối đa 2000 ký tự").optional(),
  })
  .refine((data) => (data.content?.trim().length ?? 0) > 0, {
    message: "Bài viết cần có nội dung (ảnh sẽ được kiểm tra riêng)",
    path: ["content"],
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
