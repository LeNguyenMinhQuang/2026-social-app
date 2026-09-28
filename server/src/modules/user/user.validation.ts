import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(30, "Username tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và dấu gạch dưới")
    .optional(),
  bio: z.string().max(160, "Bio tối đa 160 ký tự").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
