import type { RoomType, RoomStatus, PropertyStatus } from "../database/enums";

/**
 * Room entity — domain representation.
 */
export interface RoomEntity {
    id: string;
    propertyId: string;
    roomNumber: string;
    type: RoomType;
    floor: number;
    basePrice: number;
    status: RoomStatus;
    currentOccupancy: number;
    maxOccupancy: number;
    images: string[];
    description: string;
    createdAt: string;
    property?: PropertyEntity;
}

/**
 * Property entity — Viramah locations.
 */
export interface PropertyEntity {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { lat: number; lng: number } | null;
    status: PropertyStatus;
    createdAt: string;
}
