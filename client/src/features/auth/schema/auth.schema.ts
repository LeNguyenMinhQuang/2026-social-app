import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập password"),
});

export const registerFormSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username phải có ít nhất 3 ký tự")
      .max(30, "Username tối đa 30 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và dấu gạch dưới"),
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Password phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Password phải có ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Password phải có ít nhất 1 số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
