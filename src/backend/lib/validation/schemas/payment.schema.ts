import { z } from "zod";

export const createPaymentOrderSchema = z.object({
    bookingId: z.string().uuid("Invalid booking ID"),
    amount: z.number().positive("Amount must be positive").max(10000000, "Amount exceeds limit"),
});

export const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
});
