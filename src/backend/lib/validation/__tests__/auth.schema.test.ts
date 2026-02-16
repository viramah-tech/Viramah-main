import { describe, it, expect } from "vitest";
import { otpSendSchema, otpVerifySchema, phoneSchema } from "@/backend/lib/validation/schemas/auth.schema";

describe("Auth Validation Schemas", () => {
    describe("phoneSchema", () => {
        it("accepts valid Indian phone numbers (+91)", () => {
            expect(phoneSchema.parse("+919876543210")).toBe("+919876543210");
            expect(phoneSchema.parse("+916000000000")).toBe("+916000000000");
        });

        it("rejects phone without +91 prefix", () => {
            expect(() => phoneSchema.parse("9876543210")).toThrow();
            expect(() => phoneSchema.parse("+19876543210")).toThrow();
        });

        it("rejects phone numbers starting with 0-5 after +91", () => {
            expect(() => phoneSchema.parse("+910000000000")).toThrow();
            expect(() => phoneSchema.parse("+915000000000")).toThrow();
        });

        it("rejects phone numbers with wrong length", () => {
            expect(() => phoneSchema.parse("+9198765432")).toThrow();   // too short
            expect(() => phoneSchema.parse("+9198765432100")).toThrow(); // too long
        });

        it("rejects non-numeric characters", () => {
            expect(() => phoneSchema.parse("+91987654321a")).toThrow();
            expect(() => phoneSchema.parse("+91-987-654-3210")).toThrow();
        });
    });

    describe("otpSendSchema", () => {
        it("validates correct payload", () => {
            const result = otpSendSchema.parse({ phone: "+919876543210" });
            expect(result.phone).toBe("+919876543210");
        });

        it("rejects missing phone", () => {
            expect(() => otpSendSchema.parse({})).toThrow();
        });

        it("rejects invalid phone", () => {
            expect(() => otpSendSchema.parse({ phone: "1234" })).toThrow();
        });
    });

    describe("otpVerifySchema", () => {
        it("validates correct payload", () => {
            const result = otpVerifySchema.parse({
                phone: "+919876543210",
                code: "123456",
            });
            expect(result.code).toBe("123456");
        });

        it("rejects OTP with wrong length", () => {
            expect(() =>
                otpVerifySchema.parse({ phone: "+919876543210", code: "12345" })
            ).toThrow();
            expect(() =>
                otpVerifySchema.parse({ phone: "+919876543210", code: "1234567" })
            ).toThrow();
        });

        it("rejects non-numeric OTP", () => {
            expect(() =>
                otpVerifySchema.parse({ phone: "+919876543210", code: "abcdef" })
            ).toThrow();
        });

        it("rejects missing fields", () => {
            expect(() => otpVerifySchema.parse({ phone: "+919876543210" })).toThrow();
            expect(() => otpVerifySchema.parse({ code: "123456" })).toThrow();
        });
    });
});
