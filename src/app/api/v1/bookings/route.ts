import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { createBooking, getBookings } from "@/backend/services/booking/booking.service";
import { createBookingSchema } from "@/backend/lib/validation";

// POST /api/v1/bookings — Create a new booking
const POST = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    const booking = await createBooking(
        request.user.profileId,
        validated.roomId,
        validated.checkIn,
        validated.checkOut,
        validated.promoCode
    );

    return NextResponse.json({ data: booking }, { status: 201 });
}));

// GET /api/v1/bookings — List user's bookings
const GET = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const bookings = await getBookings(request.user.profileId);
    return NextResponse.json({ data: bookings });
}));

export { POST, GET };
