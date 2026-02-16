import { z } from "zod";

export const phoneSchema = z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian phone number");

export const otpSendSchema = z.object({
    phone: phoneSchema,
});

export const otpVerifySchema = z.object({
    phone: phoneSchema,
    code: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});
