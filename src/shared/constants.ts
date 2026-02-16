/**
 * Shared constants — used by both frontend and backend.
 */

export const APP_NAME = "Viramah";
export const APP_TAGLINE = "The Art of the Rest";

export const CURRENCIES = {
    INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
} as const;

export const DEFAULT_CURRENCY = CURRENCIES.INR;

export const ROOM_TYPE_LABELS: Record<string, string> = {
    "1-seater": "The Solo",
    "2-seater": "The Duo",
    "3-seater": "The Trio",
    "4-seater": "The Quad",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    partial: "Partially Paid",
    paid: "Paid",
    refunded: "Refunded",
};

export const KYC_STATUS_LABELS: Record<string, string> = {
    pending: "Not Submitted",
    submitted: "Under Review",
    verified: "Verified ✓",
    rejected: "Rejected",
    expired: "Expired",
};
