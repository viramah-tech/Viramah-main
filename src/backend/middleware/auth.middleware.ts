import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/backend/lib/supabase/server";
import { AuthError } from "@/backend/lib/errors";
import type { UserRole } from "@/backend/types/database/enums";

/**
 * Extended NextRequest with user context injected by auth middleware.
 */
export interface AuthenticatedRequest extends NextRequest {
    user: {
        id: string;
        email: string;
        role: UserRole;
        profileId: string;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (request: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Middleware: Validates Supabase session and injects user context.
 * Wraps route handlers — if auth fails, returns 401 before handler runs.
 * Supports both simple routes and routes with params (e.g. [id]).
 */
export function withAuth(handler: RouteHandler) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
        const supabase = createServerClient();

        // Get session from Authorization header
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            throw new AuthError("Missing authorization token", "AUTH_REQUIRED");
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new AuthError("Invalid or expired token", "AUTH_INVALID_TOKEN");
        }

        // Fetch profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, is_active")
            .eq("user_id", user.id)
            .single();

        if (!profile || !profile.is_active) {
            throw new AuthError("Profile not found or inactive", "AUTH_FORBIDDEN");
        }

        // Inject user context into the request
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = {
            id: user.id,
            email: user.email ?? "",
            role: (user.user_metadata?.role as UserRole) ?? "guest",
            profileId: profile.id,
        };

        return handler(authenticatedRequest, ...args);
    };
}
