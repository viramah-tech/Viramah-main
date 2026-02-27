// ── In-memory OTP store (server-side only, never sent to client) ──
// Structure: email → { otp, expiresAt, attempts }
export interface OTPEntry {
    otp: string;
    expiresAt: number;
    attempts: number;
}

declare global {
    var otpStore: Map<string, OTPEntry> | undefined;
}

// Global Map persists across requests within the same server instance
// and survives Next.js dev server hot reloads
export const otpStore = globalThis.otpStore || new Map<string, OTPEntry>();

if (process.env.NODE_ENV !== "production") {
    globalThis.otpStore = otpStore;
}
