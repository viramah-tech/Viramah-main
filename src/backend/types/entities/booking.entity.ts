import type { BookingStatus, PaymentStatus, DepositStatus } from "../database/enums";

/**
 * Booking entity — domain representation.
 */
export interface BookingEntity {
    id: string;
    studentId: string;
    roomId: string;
    status: BookingStatus;
    checkInDate: string;
    checkOutDate: string | null;
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    securityDeposit: number;
    depositStatus: DepositStatus;
    createdAt: string;
    confirmedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    metadata: Record<string, unknown> | null;
}
