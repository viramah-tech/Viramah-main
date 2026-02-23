import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Simple health check endpoint.
 * Use this to verify API routes are alive on Amplify after deploying:
 *   Visit https://viramahstay.com/api/health in your browser.
 *   If it returns {"ok":true} → SSR compute is working.
 *   If it returns 404 → Amplify platform must be changed to "Web compute".
 */
export async function GET() {
    return NextResponse.json({
        ok: true,
        timestamp: new Date().toISOString(),
        env: {
            resendKeySet: !!process.env.RESEND_API_KEY,
            fromEmailSet: !!process.env.RESEND_FROM_EMAIL,
            sheetsUrlSet: !!process.env.GOOGLE_SHEET_WEBHOOK_URL,
            appUrlSet: !!process.env.NEXT_PUBLIC_APP_URL,
        },
    });
}
