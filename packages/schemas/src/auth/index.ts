import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(1, "Name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const SignInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const MagicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string().uuid(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type SignUp = z.infer<typeof SignUpSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
export type MagicLink = z.infer<typeof MagicLinkSchema>;
export type Session = z.infer<typeof SessionSchema>;
