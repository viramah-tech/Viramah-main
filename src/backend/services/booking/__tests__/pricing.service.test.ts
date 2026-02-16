import { describe, it, expect } from "vitest";
import { calculatePrice } from "@/backend/services/booking/pricing.service";

describe("Pricing Service", () => {
    const baseRoom = { basePrice: 10000, type: "1-seater" };

    describe("calculatePrice — basic pricing", () => {
        it("calculates correct price for 30-night stay", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-07-01"),
            });

            expect(result.nights).toBe(30);
            expect(result.baseAmount).toBe(300000); // 10000 × 30
            expect(result.discountAmount).toBe(0); // No long-term discount under 180 nights
            expect(result.taxAmount).toBeGreaterThan(0); // 18% GST
            expect(result.totalAmount).toBe(result.baseAmount - result.discountAmount + result.taxAmount);
        });

        it("minimum 1 night for same-day checkout", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-06-01"),
            });

            expect(result.nights).toBe(1);
        });
    });

    describe("calculatePrice — seasonal pricing", () => {
        it("applies 10% seasonal multiplier in March (exam season)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-03-01"),
                checkOut: new Date("2026-03-02"),
            });

            expect(result.baseAmount).toBe(11000); // 10000 × 1.10
        });

        it("applies 10% seasonal multiplier in October (exam season)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-10-01"),
                checkOut: new Date("2026-10-02"),
            });

            expect(result.baseAmount).toBe(11000);
        });

        it("no seasonal multiplier in June (off-season)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-15"),
                checkOut: new Date("2026-06-16"),
            });

            expect(result.baseAmount).toBe(10000);
        });
    });

    describe("calculatePrice — long-term discounts", () => {
        it("applies 5% discount for 6+ month stay (180 nights)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-01-01"),
                checkOut: new Date("2026-07-01"),
            });

            expect(result.nights).toBe(181);
            expect(result.priceBreakdown.longTermDiscount).toBe(0.05);
        });

        it("applies 10% discount for 12+ month stay (365 nights)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-01-01"),
                checkOut: new Date("2027-01-01"),
            });

            expect(result.nights).toBe(365);
            expect(result.priceBreakdown.longTermDiscount).toBe(0.10);
        });

        it("no discount for short stay (29 nights)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-06-30"),
            });

            expect(result.priceBreakdown.longTermDiscount).toBe(0);
        });
    });

    describe("calculatePrice — promo codes", () => {
        it("applies VIRAMAH10 promo code (10% off)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-06-02"),
                promoCode: "VIRAMAH10",
            });

            expect(result.priceBreakdown.promoDiscount).toBe(0.10);
            expect(result.discountAmount).toBe(1000); // 10% of 10000
        });

        it("applies WELCOME5 promo code (5% off)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-06-02"),
                promoCode: "WELCOME5",
            });

            expect(result.priceBreakdown.promoDiscount).toBe(0.05);
        });

        it("handles unknown promo code gracefully (0% discount)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-06-02"),
                promoCode: "INVALID_CODE",
            });

            expect(result.priceBreakdown.promoDiscount).toBe(0);
        });

        it("promo codes are case-insensitive", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-06-02"),
                promoCode: "viramah10",
            });

            expect(result.priceBreakdown.promoDiscount).toBe(0.10);
        });
    });

    describe("calculatePrice — GST calculation", () => {
        it("applies 18% GST on subtotal (base - discounts)", () => {
            const result = calculatePrice({
                room: baseRoom,
                checkIn: new Date("2026-06-01"),
                checkOut: new Date("2026-06-02"),
            });

            const expectedSubtotal = result.baseAmount - result.discountAmount;
            const expectedTax = Math.round(expectedSubtotal * 0.18);

            expect(result.taxAmount).toBe(expectedTax);
            expect(result.priceBreakdown.gstRate).toBe(0.18);
        });
    });

    describe("calculatePrice — price breakdown integrity", () => {
        it("total = base - discount + tax (always)", () => {
            const scenarios = [
                { room: baseRoom, checkIn: new Date("2026-06-01"), checkOut: new Date("2026-06-02") },
                { room: baseRoom, checkIn: new Date("2026-03-01"), checkOut: new Date("2026-03-31"), promoCode: "VIRAMAH10" },
                { room: { basePrice: 15000, type: "1-seater" }, checkIn: new Date("2026-01-01"), checkOut: new Date("2027-01-01") },
            ];

            for (const scenario of scenarios) {
                const result = calculatePrice(scenario);
                const expectedTotal = result.baseAmount - result.discountAmount + result.taxAmount;
                expect(result.totalAmount).toBe(expectedTotal);
            }
        });

        it("all amounts are rounded to integers (no floating point)", () => {
            const result = calculatePrice({
                room: { basePrice: 7777, type: "2-seater" },
                checkIn: new Date("2026-03-01"),
                checkOut: new Date("2026-03-15"),
                promoCode: "EARLYBIRD15",
            });

            expect(Number.isInteger(result.baseAmount)).toBe(true);
            expect(Number.isInteger(result.discountAmount)).toBe(true);
            expect(Number.isInteger(result.taxAmount)).toBe(true);
            expect(Number.isInteger(result.totalAmount)).toBe(true);
        });
    });
});
