import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { verifyPayment } from "@/backend/services/payment/gateway.service";
import { verifyPaymentSchema } from "@/backend/lib/validation";

// POST /api/v1/payments/verify — Verify Razorpay payment signature
const POST = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const body = await request.json();
    const validated = verifyPaymentSchema.parse(body);

    const result = await verifyPayment(
        validated.razorpayOrderId,
        validated.razorpayPaymentId,
        validated.razorpaySignature
    );

    return NextResponse.json({ data: result });
}));

export { POST };
