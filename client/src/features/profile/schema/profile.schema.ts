import { z } from "zod";

export const editProfileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(30, "Username tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và dấu gạch dưới"),
  bio: z.string().max(160, "Bio tối đa 160 ký tự"),
});

export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;
