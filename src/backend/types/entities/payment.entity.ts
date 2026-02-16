import type { PaymentGateway, PaymentGatewayStatus, PaymentMethod } from "../database/enums";

/**
 * Payment entity — domain representation.
 */
export interface PaymentEntity {
    id: string;
    bookingId: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
    gatewayOrderId: string;
    gatewayPaymentId: string | null;
    status: PaymentGatewayStatus;
    method: PaymentMethod | null;
    receiptUrl: string | null;
    failureReason: string | null;
    createdAt: string;
    capturedAt: string | null;
    refundedAt: string | null;
}
