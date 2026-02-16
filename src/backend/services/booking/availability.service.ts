import { createServerClient } from "@/backend/lib/supabase/server";
import { RoomUnavailableError } from "@/backend/lib/errors";
import type { RoomEntity } from "@/backend/types/entities/room.entity";

/**
 * Check if a room is available for the given date range.
 */
export async function checkAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string
): Promise<{ available: boolean; currentOccupancy: number; maxOccupancy: number }> {
    const supabase = createServerClient();

    // Get room details
    const { data: room } = await supabase
        .from("rooms")
        .select("id, status, current_occupancy, max_occupancy")
        .eq("id", roomId)
        .single();

    if (!room) {
        throw new RoomUnavailableError(roomId);
    }

    if (room.status !== "available") {
        return { available: false, currentOccupancy: room.current_occupancy, maxOccupancy: room.max_occupancy };
    }

    // Check for overlapping confirmed bookings
    const { data: overlapping } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .in("status", ["confirmed", "active"])
        .lte("check_in_date", checkOut)
        .gte("check_out_date", checkIn);

    const hasConflict = overlapping && overlapping.length >= room.max_occupancy;

    return {
        available: !hasConflict,
        currentOccupancy: room.current_occupancy,
        maxOccupancy: room.max_occupancy,
    };
}

/**
 * Search rooms with optional filters.
 */
export async function searchRooms(filters: {
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}): Promise<{ rooms: RoomEntity[]; total: number }> {
    const supabase = createServerClient();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = supabase
        .from("rooms")
        .select("*, properties!inner(*)", { count: "exact" })
        .eq("status", "available");

    if (filters.city) {
        query = query.eq("properties.city", filters.city);
    }
    if (filters.type) {
        query = query.eq("type", filters.type);
    }
    if (filters.minPrice) {
        query = query.gte("base_price", filters.minPrice);
    }
    if (filters.maxPrice) {
        query = query.lte("base_price", filters.maxPrice);
    }

    const { data, count, error } = await query
        .range(offset, offset + limit - 1)
        .order("base_price", { ascending: true });

    if (error) {
        console.error("[Availability Service] Search error:", error);
        return { rooms: [], total: 0 };
    }

    const rooms: RoomEntity[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        propertyId: row.property_id as string,
        roomNumber: row.room_number as string,
        type: row.type as RoomEntity["type"],
        floor: row.floor as number,
        basePrice: row.base_price as number,
        status: row.status as RoomEntity["status"],
        currentOccupancy: row.current_occupancy as number,
        maxOccupancy: row.max_occupancy as number,
        images: row.images as string[],
        description: row.description as string,
        createdAt: row.created_at as string,
    }));

    return { rooms, total: count ?? 0 };
}
