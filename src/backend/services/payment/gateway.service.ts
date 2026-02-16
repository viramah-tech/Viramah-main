import { createServerClient } from "@/backend/lib/supabase/server";
import { PaymentError, InvalidSignatureError } from "@/backend/lib/errors";
import type { PaymentEntity } from "@/backend/types/entities/payment.entity";

/**
 * Create a payment order (Razorpay).
 * Returns order details for client-side checkout.
 */
export async function createPaymentOrder(
    bookingId: string,
    amount: number
): Promise<{ orderId: string; amount: number; currency: string }> {
    // TODO: Integrate Razorpay SDK
    // const razorpay = new Razorpay({ key_id, key_secret });
    // const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR" });

    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const supabase = createServerClient();

    await supabase
        .from("payments")
        .insert({
            booking_id: bookingId,
            amount,
            currency: "INR",
            gateway: "razorpay",
            gateway_order_id: mockOrderId,
            status: "created",
        });

    return {
        orderId: mockOrderId,
        amount: amount * 100, // Razorpay uses paise
        currency: "INR",
    };
}

/**
 * Verify Razorpay payment signature.
 */
export async function verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): Promise<{ success: boolean; paymentId: string }> {
    // TODO: Verify HMAC signature with Razorpay webhook secret
    // const crypto = require("crypto");
    // const expectedSignature = crypto
    //     .createHmac("sha256", RAZORPAY_KEY_SECRET)
    //     .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    //     .digest("hex");
    // if (expectedSignature !== razorpaySignature) throw new InvalidSignatureError();

    const supabase = createServerClient();

    // Update payment record
    const { data: payment, error } = await supabase
        .from("payments")
        .update({
            gateway_payment_id: razorpayPaymentId,
            status: "captured",
            captured_at: new Date().toISOString(),
        })
        .eq("gateway_order_id", razorpayOrderId)
        .select("id, booking_id")
        .single();

    if (error || !payment) {
        throw new PaymentError("Payment verification failed");
    }

    // Update booking status to confirmed
    await supabase
        .from("bookings")
        .update({
            status: "confirmed",
            payment_status: "paid",
            confirmed_at: new Date().toISOString(),
        })
        .eq("id", payment.booking_id);

    return { success: true, paymentId: payment.id };
}

/**
 * Handle Razorpay webhook events.
 */
export async function handleWebhook(event: string, payload: Record<string, unknown>): Promise<void> {
    const supabase = createServerClient();

    switch (event) {
        case "payment.captured":
            // Already handled in verifyPayment
            break;

        case "payment.failed": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orderId = (payload as any)?.payment?.entity?.order_id as string | undefined;
            if (orderId) {
                await supabase
                    .from("payments")
                    .update({ status: "failed", failure_reason: "Payment failed via webhook" })
                    .eq("gateway_order_id", orderId);
            }
            break;
        }

        case "refund.processed": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const paymentId = (payload as any)?.refund?.entity?.payment_id as string | undefined;
            if (paymentId) {
                await supabase
                    .from("payments")
                    .update({ status: "refunded", refunded_at: new Date().toISOString() })
                    .eq("gateway_payment_id", paymentId);
            }
            break;
        }

        default:
            console.log(`[Payment Service] Unhandled webhook event: ${event}`);
    }
}
