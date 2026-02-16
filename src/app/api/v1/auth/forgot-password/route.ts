import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { createServerClient } from "@/backend/lib/supabase/server";

/**
 * POST /api/v1/auth/forgot-password
 *
 * Sends a password reset email via Supabase Auth.
 * Always returns 200 regardless of whether email exists (security best practice).
 *
 * Body: { email: string }
 */
async function handleForgotPassword(request: NextRequest) {
    const body = await request.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email) {
        return NextResponse.json(
            { error: "Email is required", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json(
            { error: "Invalid email format", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    const supabase = createServerClient();

    // Determine the redirect URL (use the origin of the request)
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const redirectTo = `${origin}/reset-password`;

    // Send password reset email via Supabase
    // We don't check if the email exists first (security best practice)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });

    if (error) {
        console.error("[ForgotPassword] Supabase error:", error.message);
        // Don't reveal whether the email exists
    }

    // Always return success (security: don't reveal email existence)
    return NextResponse.json({
        message: "If an account with that email exists, a password reset link has been sent.",
        success: true,
    });
}

/**
 * POST /api/v1/auth/reset-password
 *
 * Updates the user's password after clicking the reset link.
 * Requires a valid session (user follows the magic link from their email).
 *
 * Body: { password: string }
 */
async function handleResetPassword(request: NextRequest) {
    const body = await request.json();
    const password = body?.password;

    if (!password || password.length < 6) {
        return NextResponse.json(
            { error: "Password must be at least 6 characters", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    const supabase = createServerClient();

    // Get session from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
        return NextResponse.json(
            { error: "Missing authorization. Please use the link from your email.", code: "AUTH_REQUIRED" },
            { status: 401 }
        );
    }

    // Verify the token first
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json(
            { error: "Reset link has expired. Please request a new one.", code: "AUTH_EXPIRED" },
            { status: 401 }
        );
    }

    // Update the password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password,
    });

    if (updateError) {
        console.error("[ResetPassword] Update error:", updateError.message);
        return NextResponse.json(
            { error: "Failed to update password. Please try again.", code: "UPDATE_FAILED" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        message: "Password updated successfully. You can now sign in with your new password.",
        success: true,
    });
}

export const POST = withErrorHandler(async (request: NextRequest) => {
    // Route based on the action query param or path
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "reset") {
        return handleResetPassword(request);
    }

    return handleForgotPassword(request);
});
