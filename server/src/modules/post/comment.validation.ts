import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Nội dung không được để trống").max(500, "Tối đa 500 ký tự"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
