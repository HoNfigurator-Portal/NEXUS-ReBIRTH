import { z } from "zod";

export const accountNameSchema = z
    .string()
    .min(3, "Account name must be at least 3 characters")
    .max(15, "Account name must be at most 15 characters")
    .regex(
        /^[a-zA-Z0-9\-_`]+$/,
        "Account name may only contain letters, numbers, hyphens, underscores, and backticks"
    );

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
    );

export const registerFormSchema = z
    .object({
        name: accountNameSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
