/**
 * Shared types between frontend and backend.
 * Import these in both `src/components/` and `src/backend/`.
 */

export type { UserRole, KycStatus, BookingStatus, PaymentStatus, RoomType, RoomStatus } from "@/backend/types/database/enums";

export type { UserEntity, UserProfile, UserPreferences } from "@/backend/types/entities/user.entity";
export type { RoomEntity, PropertyEntity } from "@/backend/types/entities/room.entity";
export type { BookingEntity } from "@/backend/types/entities/booking.entity";
export type { PaymentEntity } from "@/backend/types/entities/payment.entity";

export type { ApiResponse, PaginationMeta, ApiErrorResponse } from "@/backend/types/api/responses";
