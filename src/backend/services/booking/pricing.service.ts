import type { RoomEntity } from "@/backend/types/entities/room.entity";

interface PricingInput {
    room: { basePrice: number; type: string };
    checkIn: Date;
    checkOut: Date;
    promoCode?: string;
}

interface PricingResult {
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    nights: number;
    priceBreakdown: {
        perNight: number;
        seasonalMultiplier: number;
        longTermDiscount: number;
        promoDiscount: number;
        gstRate: number;
    };
}

/**
 * Calculate total price for a booking.
 * Includes seasonal pricing, long-term discounts, and promo codes.
 */
export function calculatePrice(input: PricingInput): PricingResult {
    const nights = calculateNights(input.checkIn, input.checkOut);
    const perNight = input.room.basePrice;

    // Seasonal multiplier (exam season: +10%)
    const seasonalMultiplier = getSeasonalMultiplier(input.checkIn);

    // Long-term discount
    const longTermDiscount = getLongTermDiscount(nights);

    // Promo code discount
    const promoDiscount = input.promoCode ? getPromoDiscount(input.promoCode) : 0;

    // Calculate
    const baseAmount = perNight * nights * seasonalMultiplier;
    const discountAmount = baseAmount * (longTermDiscount + promoDiscount);
    const subtotal = baseAmount - discountAmount;
    const gstRate = 0.18; // 18% GST
    const taxAmount = subtotal * gstRate;
    const totalAmount = subtotal + taxAmount;

    return {
        baseAmount: Math.round(baseAmount),
        discountAmount: Math.round(discountAmount),
        taxAmount: Math.round(taxAmount),
        totalAmount: Math.round(totalAmount),
        nights,
        priceBreakdown: {
            perNight,
            seasonalMultiplier,
            longTermDiscount,
            promoDiscount,
            gstRate,
        },
    };
}

function calculateNights(checkIn: Date, checkOut: Date): number {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getSeasonalMultiplier(checkIn: Date): number {
    const month = checkIn.getMonth();
    // Exam season: March-April, Oct-Nov (+10%)
    if (month === 2 || month === 3 || month === 9 || month === 10) {
        return 1.10;
    }
    return 1.0;
}

function getLongTermDiscount(nights: number): number {
    if (nights >= 365) return 0.10; // 12+ months: 10%
    if (nights >= 180) return 0.05; // 6+ months: 5%
    return 0;
}

function getPromoDiscount(promoCode: string): number {
    // TODO: Look up promo codes from database
    const promoCodes: Record<string, number> = {
        "VIRAMAH10": 0.10,
        "WELCOME5": 0.05,
        "EARLYBIRD15": 0.15,
    };
    return promoCodes[promoCode.toUpperCase()] ?? 0;
}
