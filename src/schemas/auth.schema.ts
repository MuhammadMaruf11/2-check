import * as z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(100),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  // image: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type RegisterTypes = z.infer<typeof registerSchema>;
export type LoginTypes = z.infer<typeof loginSchema>;
