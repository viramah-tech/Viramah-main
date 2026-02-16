import { NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, type AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { createServerClient } from "@/backend/lib/supabase/server";

/**
 * GET /api/v1/student/dashboard
 *
 * Returns aggregated dashboard data for the authenticated student:
 * - Profile summary
 * - Active booking details with room info
 * - Wallet balance
 * - Recent wallet transactions
 * - Upcoming amenity bookings
 * - Quick stats (days remaining, next payment, etc.)
 */
async function handler(request: AuthenticatedRequest) {
    const supabase = createServerClient();
    const profileId = request.user.profileId;

    // Fetch all data in parallel for performance
    const [
        profileResult,
        bookingsResult,
        walletResult,
        recentTransactionsResult,
        amenityBookingsResult,
    ] = await Promise.all([
        // Profile
        supabase
            .from("profiles")
            .select("id, full_name, avatar_url, kyc_status, preferences, wallet_balance")
            .eq("id", profileId)
            .single(),

        // Active/recent bookings with room + property info
        supabase
            .from("bookings")
            .select(`
                id, status, check_in_date, check_out_date,
                total_amount, payment_status, security_deposit, deposit_status,
                created_at, confirmed_at,
                rooms:room_id (
                    id, room_number, type, base_price, floor, description, images,
                    properties:property_id (
                        id, name, city, address
                    )
                )
            `)
            .eq("student_id", profileId)
            .in("status", ["active", "confirmed", "pending"])
            .order("created_at", { ascending: false })
            .limit(5),

        // Wallet balance (from profile or calculated)
        supabase
            .from("wallet_transactions")
            .select("balance_after")
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(1),

        // Recent wallet transactions
        supabase
            .from("wallet_transactions")
            .select("id, type, amount, balance_after, source, description, created_at")
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(5),

        // Upcoming amenity bookings
        supabase
            .from("amenity_bookings")
            .select("id, amenity_id, booking_date, time_slot_start, time_slot_end, status")
            .eq("profile_id", profileId)
            .gte("booking_date", new Date().toISOString().split("T")[0])
            .in("status", ["booked"])
            .order("booking_date", { ascending: true })
            .limit(5),
    ]);

    // Build profile data
    const profile = profileResult.data;

    // Find the primary active booking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookings = (bookingsResult.data ?? []).map((b: any) => ({
        id: b.id,
        status: b.status,
        checkInDate: b.check_in_date,
        checkOutDate: b.check_out_date,
        totalAmount: b.total_amount,
        paymentStatus: b.payment_status,
        securityDeposit: b.security_deposit,
        depositStatus: b.deposit_status,
        createdAt: b.created_at,
        confirmedAt: b.confirmed_at,
        room: b.rooms ? {
            id: b.rooms.id,
            roomNumber: b.rooms.room_number,
            type: b.rooms.type,
            basePrice: b.rooms.base_price,
            floor: b.rooms.floor,
            description: b.rooms.description,
            images: b.rooms.images,
            property: b.rooms.properties ? {
                id: b.rooms.properties.id,
                name: b.rooms.properties.name,
                city: b.rooms.properties.city,
                address: b.rooms.properties.address,
            } : null,
        } : null,
    }));

    const activeBooking = bookings.find((b) => b.status === "active") || bookings[0] || null;

    // Calculate wallet balance
    const walletBalance = walletResult.data?.[0]?.balance_after ?? 0;

    // Calculate quick stats
    const stats = calculateQuickStats(activeBooking);

    // Recent transactions
    const recentTransactions = (recentTransactionsResult.data ?? []).map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balance_after,
        source: t.source,
        description: t.description,
        createdAt: t.created_at,
    }));

    // Upcoming amenity bookings
    const upcomingAmenities = (amenityBookingsResult.data ?? []).map((a) => ({
        id: a.id,
        amenityId: a.amenity_id,
        bookingDate: a.booking_date,
        timeSlotStart: a.time_slot_start,
        timeSlotEnd: a.time_slot_end,
        status: a.status,
    }));

    return NextResponse.json({
        profile: profile ? {
            id: profile.id,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            kycStatus: profile.kyc_status,
            preferences: profile.preferences,
        } : null,
        activeBooking,
        bookings,
        wallet: {
            balance: walletBalance,
            recentTransactions,
        },
        upcomingAmenities,
        stats,
    });
}

/**
 * Calculate quick stats for the student dashboard.
 */
function calculateQuickStats(activeBooking: Record<string, unknown> | null) {
    const now = new Date();

    if (!activeBooking) {
        return {
            hasActiveBooking: false,
            daysRemaining: null,
            nextPaymentDue: null,
            checkInDate: null,
            bookingStatus: null,
        };
    }

    const checkIn = activeBooking.checkInDate ? new Date(activeBooking.checkInDate as string) : null;
    const checkOut = activeBooking.checkOutDate ? new Date(activeBooking.checkOutDate as string) : null;

    let daysRemaining: number | null = null;
    if (checkOut) {
        const diff = checkOut.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Next payment: assume monthly on the 1st
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextPaymentDue = nextMonth.toISOString().split("T")[0];

    return {
        hasActiveBooking: true,
        daysRemaining,
        nextPaymentDue,
        checkInDate: checkIn?.toISOString().split("T")[0] ?? null,
        bookingStatus: activeBooking.status as string,
    };
}

export const GET = withErrorHandler(withAuth(handler));
