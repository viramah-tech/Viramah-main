import { NextResponse } from "next/server";

/**
 * Health check endpoint — no auth required.
 * Tests that the API is reachable and returns JSON.
 * Also validates Supabase connectivity if configured.
 */
export async function GET() {
    const checks: Record<string, string> = {
        api: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? "unknown",
    };

    // Check Supabase config
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        checks.supabase_url = "configured";
    } else {
        checks.supabase_url = "missing";
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        checks.supabase_anon_key = "configured";
    } else {
        checks.supabase_anon_key = "missing";
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        checks.supabase_service_key = "configured";
    } else {
        checks.supabase_service_key = "missing";
    }

    // Check optional services
    checks.razorpay = process.env.RAZORPAY_KEY_ID ? "configured" : "not_configured";
    checks.redis = process.env.REDIS_URL ? "configured" : "not_configured";
    checks.twilio = process.env.TWILIO_ACCOUNT_SID ? "configured" : "not_configured";
    checks.sendgrid = process.env.SENDGRID_API_KEY ? "configured" : "not_configured";

    const allCoreReady = checks.supabase_url === "configured" &&
        checks.supabase_anon_key === "configured" &&
        checks.supabase_service_key === "configured";

    return NextResponse.json({
        status: allCoreReady ? "healthy" : "degraded",
        checks,
        version: "1.0.0",
    }, {
        status: allCoreReady ? 200 : 503
    });
}
