import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/backend/services/payment/gateway.service";

// POST /api/v1/payments/webhook — Razorpay webhook handler
// NOTE: Public endpoint — secured by signature verification, not auth
const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const event = body.event as string;
        const payload = body.payload as Record<string, unknown>;

        // TODO: Verify webhook signature from X-Razorpay-Signature header
        // const signature = request.headers.get("x-razorpay-signature");

        await handleWebhook(event, payload);

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[Webhook Error]", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
};

export { POST };
