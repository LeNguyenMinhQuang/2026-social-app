import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(30, "Username tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và dấu gạch dưới"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Password phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Password phải có ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Password phải có ít nhất 1 số"),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Password không được để trống"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
