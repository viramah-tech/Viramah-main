import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { getBooking, cancelBooking } from "@/backend/services/booking/booking.service";
import { cancelBookingSchema } from "@/backend/lib/validation";

// GET /api/v1/bookings/[id] — Get booking details
const GET = withErrorHandler(withAuth(async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const booking = await getBooking(id, request.user.profileId);

    if (!booking) {
        return NextResponse.json(
            { error: "Booking not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    return NextResponse.json({ data: booking });
}));

export { GET };
