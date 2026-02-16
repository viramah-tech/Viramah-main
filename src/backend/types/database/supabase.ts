import type {
    UserRole, KycStatus, BookingStatus, PaymentStatus, PaymentGatewayStatus,
    PaymentMethod, PaymentGateway, RoomType, RoomStatus, PropertyStatus,
    DepositStatus, WalletTransactionType, WalletTransactionSource,
    AmenityBookingStatus, IdDocumentType, EmergencyRelationship,
    ParentRelationship, ParentAccessLevel, AuditAction,
    DietaryPreference, SleepSchedule, NoisePreference,
} from "./enums";

/**
 * Supabase-generated table types.
 * Shape matches exact database schema from migrations.
 */

export interface DbProfile {
    id: string;
    user_id: string;
    full_name: string;
    date_of_birth: string | null;
    avatar_url: string | null;
    emergency_contact_id: string | null;
    kyc_status: KycStatus;
    kyc_verified_at: string | null;
    preferences: {
        dietary: DietaryPreference | null;
        sleep: SleepSchedule | null;
        noise: NoisePreference | null;
    } | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbEmergencyContact {
    id: string;
    name: string;
    phone: string;
    relationship: EmergencyRelationship;
    created_by: string;
    created_at: string;
}

export interface DbKycDocument {
    id: string;
    profile_id: string;
    document_type: IdDocumentType;
    document_number: string; // encrypted
    document_image_front: string;
    document_image_back: string | null;
    verification_status: KycStatus;
    verified_by: string | null;
    submitted_at: string;
    verified_at: string | null;
}

export interface DbProperty {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { lat: number; lng: number } | null;
    manager_id: string | null;
    status: PropertyStatus;
    created_at: string;
}

export interface DbRoom {
    id: string;
    property_id: string;
    room_number: string;
    type: RoomType;
    floor: number;
    base_price: number;
    dynamic_pricing_rules: Record<string, unknown> | null;
    status: RoomStatus;
    current_occupancy: number;
    max_occupancy: number;
    images: string[];
    description: string;
    created_at: string;
}

export interface DbBooking {
    id: string;
    student_id: string;
    room_id: string;
    status: BookingStatus;
    check_in_date: string;
    check_out_date: string | null;
    base_amount: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    payment_status: PaymentStatus;
    security_deposit: number;
    deposit_status: DepositStatus;
    created_at: string;
    confirmed_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    metadata: Record<string, unknown> | null;
}

export interface DbPayment {
    id: string;
    booking_id: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
    gateway_order_id: string;
    gateway_payment_id: string | null;
    status: PaymentGatewayStatus;
    method: PaymentMethod | null;
    receipt_url: string | null;
    failure_reason: string | null;
    created_at: string;
    captured_at: string | null;
    refunded_at: string | null;
}

export interface DbWalletTransaction {
    id: string;
    profile_id: string;
    type: WalletTransactionType;
    amount: number;
    balance_after: number;
    source: WalletTransactionSource;
    reference_id: string | null;
    description: string;
    created_at: string;
}

export interface DbAmenityBooking {
    id: string;
    profile_id: string;
    amenity_id: string;
    booking_date: string;
    time_slot_start: string;
    time_slot_end: string;
    status: AmenityBookingStatus;
    created_at: string;
}

export interface DbParentStudentLink {
    id: string;
    parent_id: string;
    student_id: string;
    relationship: ParentRelationship;
    access_level: ParentAccessLevel;
    is_verified: boolean;
    created_at: string;
    verified_at: string | null;
}

export interface DbAuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: AuditAction;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    performed_by: string;
    performed_at: string;
    ip_address: string | null;
}

/**
 * Supabase Database type definition — used for generic client typing.
 */
export interface Database {
    public: {
        Tables: {
            profiles: { Row: DbProfile };
            emergency_contacts: { Row: DbEmergencyContact };
            kyc_documents: { Row: DbKycDocument };
            properties: { Row: DbProperty };
            rooms: { Row: DbRoom };
            bookings: { Row: DbBooking };
            payments: { Row: DbPayment };
            wallet_transactions: { Row: DbWalletTransaction };
            amenity_bookings: { Row: DbAmenityBooking };
            parent_student_links: { Row: DbParentStudentLink };
            audit_logs: { Row: DbAuditLog };
        };
    };
}
