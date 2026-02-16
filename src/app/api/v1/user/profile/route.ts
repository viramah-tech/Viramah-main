import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { getSession } from "@/backend/services/auth/session.service";

// GET /api/v1/user/profile — Get current user profile
const GET = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
    const user = await getSession(token);

    if (!user) {
        return NextResponse.json(
            { error: "Profile not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    return NextResponse.json({ data: user });
}));

// PATCH /api/v1/user/profile — Update profile
const PATCH = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const body = await request.json();

    // TODO: Validate and update profile via service
    return NextResponse.json({ data: body, message: "Profile updated" });
}));

export { GET, PATCH };
