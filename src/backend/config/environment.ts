import { z } from "zod";

/**
 * Backend environment variable validation.
 * All backend services read config from here.
 * Fails fast at startup if any required variable is missing.
 */

const envSchema = z.object({
    // Database
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Redis
    REDIS_URL: z.string().url().optional(),

    // Payment
    RAZORPAY_KEY_ID: z.string().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Storage
    S3_BUCKET: z.string().min(1).optional(),
    S3_REGION: z.string().min(1).optional(),
    S3_ACCESS_KEY: z.string().min(1).optional(),
    S3_SECRET_KEY: z.string().min(1).optional(),

    // Communication
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
    TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
    TWILIO_PHONE_NUMBER: z.string().min(1).optional(),
    SENDGRID_API_KEY: z.string().min(1).optional(),

    // Security
    JWT_SECRET: z.string().min(32).optional(),
    ENCRYPTION_KEY: z.string().min(32).optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 * Optional fields allow progressive feature enablement.
 * Core Supabase fields are required for any backend operation.
 */
function loadEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error(
            "❌ Invalid backend environment variables:",
            parsed.error.flatten().fieldErrors
        );
        throw new Error("Missing required environment variables for backend.");
    }

    return parsed.data;
}

export const env = loadEnv();
