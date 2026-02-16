import { createServerClient } from "@/backend/lib/supabase/server";
import { AuthError } from "@/backend/lib/errors";

/**
 * Generate a 6-digit OTP for phone verification.
 * In production, integrate Twilio/SMS gateway to send the code.
 */
export async function generateOTP(phone: string): Promise<string> {
    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Store OTP in Redis/Supabase with TTL (5 minutes)
    // TODO: Send OTP via Twilio SMS
    console.log(`[OTP Service] Generated OTP ${otp} for ${phone}`);

    return otp;
}

/**
 * Verify OTP code against stored value.
 * Returns true if valid, throws AuthError if invalid/expired.
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
    // TODO: Look up OTP from Redis/Supabase
    // TODO: Check if expired (5 minute TTL)
    // TODO: Delete after verification (one-time use)

    // Placeholder — accept any 6-digit code in development
    if (code.length !== 6) {
        throw new AuthError("Invalid OTP format", "AUTH_INVALID_OTP");
    }

    console.log(`[OTP Service] Verified OTP for ${phone}`);
    return true;
}

/**
 * Send SMS message via configured provider (Twilio).
 */
export async function sendSMS(phone: string, message: string): Promise<void> {
    // TODO: Integrate Twilio when TWILIO_ACCOUNT_SID is configured
    console.log(`[SMS Service] Would send to ${phone}: ${message}`);
}
