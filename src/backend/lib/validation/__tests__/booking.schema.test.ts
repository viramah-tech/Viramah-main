import { describe, it, expect } from "vitest";
import { createBookingSchema, cancelBookingSchema } from "@/backend/lib/validation/schemas/booking.schema";

describe("Booking Validation Schemas", () => {
    describe("createBookingSchema", () => {
        it("validates correct booking payload", () => {
            const result = createBookingSchema.parse({
                roomId: "550e8400-e29b-41d4-a716-446655440000",
                checkIn: "2026-08-01",
                checkOut: "2026-09-01",
            });
            expect(result.roomId).toBe("550e8400-e29b-41d4-a716-446655440000");
        });

        it("accepts optional promoCode", () => {
            const result = createBookingSchema.parse({
                roomId: "550e8400-e29b-41d4-a716-446655440000",
                checkIn: "2026-08-01",
                checkOut: "2026-09-01",
                promoCode: "VIRAMAH10",
            });
            expect(result.promoCode).toBe("VIRAMAH10");
        });

        it("rejects invalid UUID for roomId", () => {
            expect(() =>
                createBookingSchema.parse({
                    roomId: "not-a-uuid",
                    checkIn: "2026-08-01",
                    checkOut: "2026-09-01",
                })
            ).toThrow();
        });

        it("rejects invalid date format", () => {
            expect(() =>
                createBookingSchema.parse({
                    roomId: "550e8400-e29b-41d4-a716-446655440000",
                    checkIn: "not-a-date",
                    checkOut: "2026-09-01",
                })
            ).toThrow();
        });

        it("rejects checkOut before checkIn", () => {
            expect(() =>
                createBookingSchema.parse({
                    roomId: "550e8400-e29b-41d4-a716-446655440000",
                    checkIn: "2026-09-01",
                    checkOut: "2026-08-01",
                })
            ).toThrow();
        });

        it("rejects missing required fields", () => {
            expect(() => createBookingSchema.parse({ roomId: "550e8400-e29b-41d4-a716-446655440000" })).toThrow();
            expect(() => createBookingSchema.parse({})).toThrow();
        });
    });

    describe("cancelBookingSchema", () => {
        it("validates reason with 10+ characters", () => {
            const result = cancelBookingSchema.parse({
                reason: "I found a better place to stay",
            });
            expect(result.reason).toBe("I found a better place to stay");
        });

        it("rejects reason shorter than 10 characters", () => {
            expect(() => cancelBookingSchema.parse({ reason: "short" })).toThrow();
        });

        it("rejects reason longer than 500 characters", () => {
            expect(() =>
                cancelBookingSchema.parse({ reason: "a".repeat(501) })
            ).toThrow();
        });

        it("rejects missing reason", () => {
            expect(() => cancelBookingSchema.parse({})).toThrow();
        });
    });
});
