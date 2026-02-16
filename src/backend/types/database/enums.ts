/**
 * Database enum types — mirrors PostgreSQL enums exactly.
 * Keep in sync with Supabase migrations.
 */

export type UserRole = "student" | "parent" | "admin" | "staff" | "guest";

export type KycStatus = "pending" | "submitted" | "verified" | "rejected" | "expired";

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";

export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";

export type PaymentGatewayStatus = "created" | "attempted" | "captured" | "failed" | "refunded";

export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

export type PaymentGateway = "razorpay" | "stripe";

export type RoomType = "1-seater" | "2-seater" | "3-seater" | "4-seater";

export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved";

export type PropertyStatus = "active" | "maintenance" | "closed";

export type DepositStatus = "pending" | "held" | "returned" | "forfeited";

export type WalletTransactionType = "credit" | "debit";

export type WalletTransactionSource = "refund" | "deposit" | "canteen" | "amenity" | "transfer";

export type AmenityBookingStatus = "booked" | "completed" | "cancelled" | "no-show";

export type IdDocumentType = "aadhaar" | "passport" | "driving_license";

export type EmergencyRelationship = "father" | "mother" | "guardian" | "sibling" | "other";

export type ParentRelationship = "father" | "mother" | "guardian";

export type ParentAccessLevel = "full" | "financial_only" | "view_only";

export type AuditAction = "insert" | "update" | "delete";

export type DietaryPreference = "vegetarian" | "non_vegetarian" | "vegan" | "jain";

export type SleepSchedule = "early_bird" | "night_owl" | "flexible";

export type NoisePreference = "quiet" | "moderate" | "active";
