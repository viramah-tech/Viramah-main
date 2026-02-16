import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Auth Callback Route Handler
 * 
 * This route handles the OAuth callback from Supabase (e.g., Google sign-in).
 * After Supabase authenticates the user, it redirects here with a `code` parameter.
 * We exchange that code for a session and redirect the user to the appropriate page.
 * 
 * Also handles:
 * - Password reset token exchange
 * - Email confirmation token exchange
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/login";

    // Use the configured site URL for production, fallback to request origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

    if (code) {
        // OAuth code exchange — create a temporary Supabase client to exchange the code
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Successful auth — redirect to the intended page
            return NextResponse.redirect(`${siteUrl}${next}`);
        }

        console.error("[Auth Callback] Code exchange error:", error.message);
    }

    if (token_hash && type) {
        // Token-based auth (password reset, email confirm)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "email" | "recovery" | "email_change" | "signup" | "invite" | "magiclink",
        });

        if (!error) {
            if (type === "recovery") {
                return NextResponse.redirect(`${siteUrl}/reset-password`);
            }
            return NextResponse.redirect(`${siteUrl}${next}`);
        }

        console.error("[Auth Callback] Token verification error:", error.message);
    }

    // Auth failed — redirect to login with error
    return NextResponse.redirect(
        `${siteUrl}/login?error=auth_callback_error`
    );
}
