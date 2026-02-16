import { z } from "zod";

export const createBookingSchema = z.object({
    roomId: z.string().uuid("Invalid room ID"),
    checkIn: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid check-in date"),
    checkOut: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid check-out date"),
    promoCode: z.string().max(20).optional(),
}).refine(
    (data) => new Date(data.checkOut) > new Date(data.checkIn),
    { message: "Check-out must be after check-in", path: ["checkOut"] }
);

export const cancelBookingSchema = z.object({
    reason: z.string().min(10, "Cancellation reason must be at least 10 characters").max(500),
});
