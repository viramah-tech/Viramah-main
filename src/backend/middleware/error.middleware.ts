import { NextRequest, NextResponse } from "next/server";
import { APIError } from "@/backend/lib/errors";
import { ZodError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Middleware: Global error handler for API routes.
 * Catches all errors and returns standardized JSON responses.
 * Must be the outermost wrapper in the middleware chain.
 */
export function withErrorHandler(handler: RouteHandler) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
        try {
            return await handler(request, ...args);
        } catch (error: unknown) {
            // Custom API errors (AuthError, BookingError, etc.)
            if (error instanceof APIError) {
                return NextResponse.json(error.toJSON(), { status: error.statusCode });
            }

            // Zod validation errors
            if (error instanceof ZodError) {
                return NextResponse.json(
                    {
                        error: "Validation failed",
                        code: "VALIDATION_ERROR",
                        details: error.flatten().fieldErrors,
                    },
                    { status: 400 }
                );
            }

            // Unexpected errors — log and return generic message
            console.error("[API Error]", error);
            return NextResponse.json(
                {
                    error: "Internal server error",
                    code: "INTERNAL_ERROR",
                },
                { status: 500 }
            );
        }
    };
}
