import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { createServerClient } from "@/backend/lib/supabase/server";

/**
 * GET /api/v1/rooms/[id]
 *
 * Returns full details for a single room, including:
 * - Room data (type, price, amenities, images, etc.)
 * - Property info (name, address, city, amenities)
 * - Current availability status
 * - Similar rooms at the same property
 *
 * This endpoint is PUBLIC — no auth required (for browsing).
 */
async function handler(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createServerClient();

    // Fetch room with property details
    const { data: room, error } = await supabase
        .from("rooms")
        .select(`
            id, room_number, type, floor, description,
            base_price, images, amenities, status,
            max_occupancy, current_occupancy,
            properties:property_id (
                id, name, description, address, city, state, pincode,
                latitude, longitude, amenities, images, status,
                contact_email, contact_phone
            )
        `)
        .eq("id", id)
        .single();

    if (error || !room) {
        return NextResponse.json(
            { error: "Room not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const property = room.properties as any;

    // Fetch similar rooms at the same property (same type, available)
    const { data: similarRooms } = await supabase
        .from("rooms")
        .select("id, room_number, type, floor, base_price, status, amenities, images")
        .eq("property_id", property?.id)
        .eq("status", "available")
        .neq("id", id)
        .limit(4);

    // Calculate availability
    const isAvailable = room.status === "available";
    const spotsLeft = room.max_occupancy - (room.current_occupancy ?? 0);

    return NextResponse.json({
        data: {
            id: room.id,
            roomNumber: room.room_number,
            type: room.type,
            floor: room.floor,
            description: room.description,
            basePrice: room.base_price,
            images: room.images ?? [],
            amenities: room.amenities ?? [],
            status: room.status,
            maxOccupancy: room.max_occupancy,
            currentOccupancy: room.current_occupancy,
            isAvailable,
            spotsLeft: Math.max(0, spotsLeft),
            property: property ? {
                id: property.id,
                name: property.name,
                description: property.description,
                address: property.address,
                city: property.city,
                state: property.state,
                pincode: property.pincode,
                location: property.latitude && property.longitude ? {
                    lat: property.latitude,
                    lng: property.longitude,
                } : null,
                amenities: property.amenities ?? [],
                images: property.images ?? [],
                contactEmail: property.contact_email,
                contactPhone: property.contact_phone,
            } : null,
            similarRooms: (similarRooms ?? []).map((r) => ({
                id: r.id,
                roomNumber: r.room_number,
                type: r.type,
                floor: r.floor,
                basePrice: r.base_price,
                status: r.status,
                amenities: r.amenities ?? [],
                image: r.images?.[0] ?? null,
            })),
        },
    });
}

export const GET = withErrorHandler(handler);
