import { describe, it, expect } from "vitest";
import { createPaymentOrderSchema, verifyPaymentSchema } from "@/backend/lib/validation/schemas/payment.schema";

describe("Payment Validation Schemas", () => {
    describe("createPaymentOrderSchema", () => {
        it("validates correct payment order payload", () => {
            const result = createPaymentOrderSchema.parse({
                bookingId: "550e8400-e29b-41d4-a716-446655440000",
                amount: 15000,
            });
            expect(result.amount).toBe(15000);
        });

        it("rejects non-UUID bookingId", () => {
            expect(() =>
                createPaymentOrderSchema.parse({ bookingId: "abc", amount: 15000 })
            ).toThrow();
        });

        it("rejects negative amount", () => {
            expect(() =>
                createPaymentOrderSchema.parse({
                    bookingId: "550e8400-e29b-41d4-a716-446655440000",
                    amount: -100,
                })
            ).toThrow();
        });

        it("rejects zero amount", () => {
            expect(() =>
                createPaymentOrderSchema.parse({
                    bookingId: "550e8400-e29b-41d4-a716-446655440000",
                    amount: 0,
                })
            ).toThrow();
        });

        it("rejects amount exceeding limit (10M)", () => {
            expect(() =>
                createPaymentOrderSchema.parse({
                    bookingId: "550e8400-e29b-41d4-a716-446655440000",
                    amount: 10000001,
                })
            ).toThrow();
        });
    });

    describe("verifyPaymentSchema", () => {
        it("validates correct verification payload", () => {
            const result = verifyPaymentSchema.parse({
                razorpayOrderId: "order_123456",
                razorpayPaymentId: "pay_789012",
                razorpaySignature: "sig_abc123def456",
            });
            expect(result.razorpayOrderId).toBe("order_123456");
        });

        it("rejects empty fields", () => {
            expect(() =>
                verifyPaymentSchema.parse({
                    razorpayOrderId: "",
                    razorpayPaymentId: "pay_789",
                    razorpaySignature: "sig_abc",
                })
            ).toThrow();
        });

        it("rejects missing fields", () => {
            expect(() =>
                verifyPaymentSchema.parse({ razorpayOrderId: "order_123" })
            ).toThrow();
        });
    });
});
