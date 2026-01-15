import { z } from "zod";

/**
 * Validation schema for User Login.
 * - Email: Must be a valid email format.
 * - Password: Minimum 6 characters required.
 */
export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

/**
 * Validation schema for User Registration.
 * - Name: Minimum 2 characters.
 * - Role: Must be either 'user' or 'vendor'.
 */
export const registerSchema = loginSchema.extend({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    role: z.enum(["user", "vendor"], {
        errorMap: () => ({ message: "Please select a valid role." }),
    }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
