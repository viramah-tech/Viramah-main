import { NextRequest, NextResponse } from "next/server";
import { APIError } from "@/backend/lib/errors";

type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

/**
 * Simple in-memory rate limiter.
 * For production, replace with Redis-based solution.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
    return (handler: RouteHandler) => {
        return async (request: NextRequest): Promise<NextResponse> => {
            const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
            const now = Date.now();

            const entry = rateLimitMap.get(ip);

            if (!entry || now > entry.resetAt) {
                rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
            } else {
                entry.count++;
                if (entry.count > maxRequests) {
                    throw new APIError(
                        "RATE_LIMIT_EXCEEDED",
                        "Too many requests. Please try again later.",
                        429
                    );
                }
            }

            return handler(request);
        };
    };
}
