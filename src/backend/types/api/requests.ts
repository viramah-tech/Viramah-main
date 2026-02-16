import type { RoomType, DietaryPreference, SleepSchedule, NoisePreference, IdDocumentType, EmergencyRelationship } from "../database/enums";

/**
 * API Request payload types.
 * These define the shape of data clients send.
 */

// Auth
export interface OtpSendRequest {
    phone: string;
}

export interface OtpVerifyRequest {
    phone: string;
    code: string;
}

// Profile
export interface ProfileUpdateRequest {
    fullName?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
}

export interface PreferencesUpdateRequest {
    dietary?: DietaryPreference;
    sleep?: SleepSchedule;
    noise?: NoisePreference;
}

// KYC
export interface KycSubmitRequest {
    documentType: IdDocumentType;
    documentNumber: string;
    documentImageFront: string; // base64 or URL
    documentImageBack?: string;
}

// Emergency Contact
export interface EmergencyContactRequest {
    name: string;
    phone: string;
    relationship: EmergencyRelationship;
}

// Rooms
export interface RoomSearchRequest {
    city?: string;
    type?: RoomType;
    minPrice?: number;
    maxPrice?: number;
    checkIn?: string;
    checkOut?: string;
    page?: number;
    limit?: number;
}

// Bookings
export interface BookingCreateRequest {
    roomId: string;
    checkIn: string;
    checkOut: string;
    promoCode?: string;
}

export interface BookingCancelRequest {
    reason: string;
}

// Payments
export interface PaymentCreateOrderRequest {
    bookingId: string;
    amount: number;
}

export interface PaymentVerifyRequest {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

// Student Wallet
export interface WalletAddRequest {
    amount: number;
    source: string;
}

// Amenity Booking
export interface AmenityBookRequest {
    amenityId: string;
    date: string;
    timeSlotStart: string;
    timeSlotEnd: string;
}

// Parent
export interface ParentLinkRequest {
    studentEmail: string;
    relationship: string;
}

export interface VisitRequest {
    studentId: string;
    date: string;
    purpose: string;
}
