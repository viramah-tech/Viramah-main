import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { verifyOTP } from "@/backend/services/auth/otp.service";
import { otpVerifySchema } from "@/backend/lib/validation";

const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validated = otpVerifySchema.parse(body);

    const isValid = await verifyOTP(validated.phone, validated.code);

    if (!isValid) {
        return NextResponse.json(
            { error: "Invalid OTP", code: "AUTH_INVALID_OTP" },
            { status: 401 }
        );
    }

    // TODO: Create Supabase session with phone number
    // const { data, error } = await supabase.auth.signInWithOtp({ phone: validated.phone });

    return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        // TODO: Return actual session tokens
    });
});

export { POST };
