import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Register Schema
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    fullName: z.object({
      firstName: z
        .string()
        .min(1, "First name is required")
        .min(2, "First name must be at least 2 characters"),
      lastName: z
        .string()
        .min(1, "Last name is required")
        .min(2, "Last name must be at least 2 characters"),
    }),
    role: z.enum(["user", "seller"]),
    // Seller specific (optional)
 
  })
