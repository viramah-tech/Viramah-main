import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { cancelBooking } from "@/backend/services/booking/booking.service";
import { cancelBookingSchema } from "@/backend/lib/validation";

// POST /api/v1/bookings/[id]/cancel — Cancel a booking
const POST = withErrorHandler(withAuth(async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const body = await request.json();
    const validated = cancelBookingSchema.parse(body);

    await cancelBooking(id, request.user.profileId, validated.reason);

    return NextResponse.json({ success: true, message: "Booking cancelled" });
}));

export { POST };
