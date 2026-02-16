import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { generateOTP } from "@/backend/services/auth/otp.service";
import { otpSendSchema } from "@/backend/lib/validation";

const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validated = otpSendSchema.parse(body);

    const otp = await generateOTP(validated.phone);

    return NextResponse.json({
        success: true,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
});

export { POST };
