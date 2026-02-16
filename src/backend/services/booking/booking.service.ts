import { createServerClient } from "@/backend/lib/supabase/server";
import { BookingError, RoomUnavailableError } from "@/backend/lib/errors";
import { checkAvailability } from "./availability.service";
import { calculatePrice } from "./pricing.service";
import type { BookingEntity } from "@/backend/types/entities/booking.entity";

/**
 * Create a new booking with room hold.
 */
export async function createBooking(
    studentProfileId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    promoCode?: string
): Promise<{ id: string; totalAmount: number; expiresAt: string }> {
    const supabase = createServerClient();

    // Check availability
    const availability = await checkAvailability(roomId, checkIn, checkOut);
    if (!availability.available) {
        throw new RoomUnavailableError(roomId);
    }

    // Get room for pricing
    const { data: room } = await supabase
        .from("rooms")
        .select("base_price, type")
        .eq("id", roomId)
        .single();

    if (!room) {
        throw new RoomUnavailableError(roomId);
    }

    // Calculate pricing
    const pricing = calculatePrice({
        room: { basePrice: room.base_price, type: room.type },
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        promoCode,
    });

    // Create booking record
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min hold

    const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
            student_id: studentProfileId,
            room_id: roomId,
            status: "pending",
            check_in_date: checkIn,
            check_out_date: checkOut,
            base_amount: pricing.baseAmount,
            discount_amount: pricing.discountAmount,
            tax_amount: pricing.taxAmount,
            total_amount: pricing.totalAmount,
            payment_status: "pending",
            security_deposit: Math.round(room.base_price * 2), // 2 months deposit
            deposit_status: "pending",
            metadata: { promoCode, expiresAt, priceBreakdown: pricing.priceBreakdown },
        })
        .select("id, total_amount")
        .single();

    if (error || !booking) {
        throw new BookingError("Failed to create booking");
    }

    return {
        id: booking.id,
        totalAmount: booking.total_amount,
        expiresAt,
    };
}

/**
 * Get booking by ID with ownership check.
 */
export async function getBooking(bookingId: string, profileId: string): Promise<BookingEntity | null> {
    const supabase = createServerClient();

    const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .eq("student_id", profileId)
        .single();

    if (!data) return null;

    return mapToBookingEntity(data);
}

/**
 * Get all bookings for a student.
 */
export async function getBookings(profileId: string): Promise<BookingEntity[]> {
    const supabase = createServerClient();

    const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", profileId)
        .order("created_at", { ascending: false });

    return (data ?? []).map(mapToBookingEntity);
}

/**
 * Cancel a booking.
 */
export async function cancelBooking(bookingId: string, profileId: string, reason: string): Promise<void> {
    const supabase = createServerClient();

    const { data: booking } = await supabase
        .from("bookings")
        .select("status")
        .eq("id", bookingId)
        .eq("student_id", profileId)
        .single();

    if (!booking) {
        throw new BookingError("Booking not found", "NOT_FOUND");
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
        throw new BookingError("Booking cannot be cancelled in current state", "BOOKING_NOT_CANCELLABLE");
    }

    await supabase
        .from("bookings")
        .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason,
        })
        .eq("id", bookingId);
}

function mapToBookingEntity(row: Record<string, unknown>): BookingEntity {
    return {
        id: row.id as string,
        studentId: row.student_id as string,
        roomId: row.room_id as string,
        status: row.status as BookingEntity["status"],
        checkInDate: row.check_in_date as string,
        checkOutDate: (row.check_out_date as string) ?? null,
        baseAmount: row.base_amount as number,
        discountAmount: row.discount_amount as number,
        taxAmount: row.tax_amount as number,
        totalAmount: row.total_amount as number,
        paymentStatus: row.payment_status as BookingEntity["paymentStatus"],
        securityDeposit: row.security_deposit as number,
        depositStatus: row.deposit_status as BookingEntity["depositStatus"],
        createdAt: row.created_at as string,
        confirmedAt: (row.confirmed_at as string) ?? null,
        cancelledAt: (row.cancelled_at as string) ?? null,
        cancellationReason: (row.cancellation_reason as string) ?? null,
        metadata: (row.metadata as Record<string, unknown>) ?? null,
    };
}
