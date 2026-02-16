import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { createPaymentOrder } from "@/backend/services/payment/gateway.service";
import { createPaymentOrderSchema } from "@/backend/lib/validation";

// POST /api/v1/payments/order — Create payment order for Razorpay
const POST = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const body = await request.json();
    const validated = createPaymentOrderSchema.parse(body);

    const order = await createPaymentOrder(validated.bookingId, validated.amount);

    return NextResponse.json({ data: order }, { status: 201 });
}));

export { POST };
