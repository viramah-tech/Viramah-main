import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { searchRooms } from "@/backend/services/booking/availability.service";

// GET /api/v1/rooms — List available rooms (public, filterable)
const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const filters = {
        city: searchParams.get("city") ?? undefined,
        type: searchParams.get("type") ?? undefined,
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    };

    const { rooms, total } = await searchRooms(filters);

    return NextResponse.json({
        data: rooms,
        meta: {
            page: filters.page ?? 1,
            limit: filters.limit ?? 20,
            total,
            totalPages: Math.ceil(total / (filters.limit ?? 20)),
        },
    });
});

export { GET };
