import { NextResponse } from "next/server";
import { ForbiddenError } from "@/backend/lib/errors";
import type { AuthenticatedRequest } from "./auth.middleware";
import type { UserRole } from "@/backend/types/database/enums";

type AuthRouteHandler = (request: AuthenticatedRequest) => Promise<NextResponse>;

/**
 * Middleware: Role-Based Access Control.
 * Use AFTER withAuth to enforce role requirements.
 *
 * @example
 * export const POST = withErrorHandler(withAuth(withRole(["admin", "staff"], handler)));
 */
export function withRole(allowedRoles: UserRole[], handler: AuthRouteHandler) {
    return async (request: AuthenticatedRequest): Promise<NextResponse> => {
        if (!allowedRoles.includes(request.user.role)) {
            throw new ForbiddenError(
                `Access denied. Required role: ${allowedRoles.join(" or ")}`
            );
        }

        return handler(request);
    };
}
