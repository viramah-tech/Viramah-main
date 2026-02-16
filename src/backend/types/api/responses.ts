import type { UserEntity } from "../entities/user.entity";
import type { RoomEntity, PropertyEntity } from "../entities/room.entity";
import type { BookingEntity } from "../entities/booking.entity";
import type { PaymentEntity } from "../entities/payment.entity";

/**
 * API Response types — standardized shapes for all endpoints.
 */

// Generic wrapper
export interface ApiResponse<T> {
    data: T;
    meta?: PaginationMeta;
}

export interface ApiErrorResponse {
    error: string;
    code: string;
    details?: Record<string, unknown>;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Auth
export interface AuthResponse {
    user: UserEntity;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface OtpSendResponse {
    success: boolean;
    expiresAt: string;
}

// Profile
export type ProfileResponse = ApiResponse<UserEntity>;

// Rooms
export type RoomListResponse = ApiResponse<RoomEntity[]>;
export type RoomDetailResponse = ApiResponse<RoomEntity & { property: PropertyEntity }>;

export interface RoomAvailabilityResponse {
    available: boolean;
    nextAvailableDate: string | null;
    currentOccupancy: number;
    maxOccupancy: number;
}

// Bookings
export type BookingListResponse = ApiResponse<BookingEntity[]>;
export type BookingDetailResponse = ApiResponse<BookingEntity>;

export interface BookingCreateResponse {
    id: string;
    status: "pending";
    totalAmount: number;
    expiresAt: string; // hold expiry
}

// Payments
export interface PaymentOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    gatewayKeyId: string;
}

export interface PaymentVerifyResponse {
    success: boolean;
    paymentId: string;
    bookingStatus: string;
}

// Wallet
export interface WalletResponse {
    balance: number;
    transactions: WalletTransactionResponse[];
}

export interface WalletTransactionResponse {
    id: string;
    type: "credit" | "debit";
    amount: number;
    balanceAfter: number;
    source: string;
    description: string;
    createdAt: string;
}

// Parent
export interface LinkedStudentResponse {
    studentId: string;
    studentName: string;
    relationship: string;
    accessLevel: string;
    isVerified: boolean;
}

export interface StudentOverviewResponse {
    student: {
        name: string;
        room: string;
        property: string;
        checkIn: string;
    };
    paymentsTotal: number;
    paymentsPending: number;
    lastPaymentDate: string | null;
}
