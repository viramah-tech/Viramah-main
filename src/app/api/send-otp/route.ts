import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { otpStore } from "@/lib/otpStore";

// ── Helpers ───────────────────────────────────────────────────────
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getResend(): Resend {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured.");
    return new Resend(key);
}

// ── POST /api/send-otp ────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
        }

        const { email, fullName } = body as Record<string, unknown>;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
            return NextResponse.json({ success: false, error: "A valid email is required." }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();
        const name = typeof fullName === "string" ? fullName.trim().split(" ")[0] : "there";

        // Generate OTP and store it (5-minute TTL, max 3 verify attempts)
        const otp = generateOTP();
        otpStore.set(cleanEmail, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
            attempts: 0,
        });

        // Send OTP email via Resend
        const resend = getResend();
        const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        const { error } = await resend.emails.send({
            from: `Viramah Stay <${fromAddress}>`,
            to: [cleanEmail],
            subject: `Your Viramah verification code: ${otp}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 0;background:#ECEAE3;font-family:'Georgia',serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
    
    <!-- Header -->
    <div style="background:#1F3A2D;padding:32px 40px 24px;text-align:center;">
      <p style="color:#D8B56A;font-size:9px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.4em;margin:0 0 12px;">Viramah Stay</p>
      <p style="color:#F6F4EF;font-size:22px;font-weight:400;margin:0;letter-spacing:0.03em;">Verification Code</p>
    </div>
    <div style="height:3px;background:linear-gradient(90deg,#1F3A2D,#D8B56A 35%,#c9a55a 65%,#1F3A2D);"></div>

    <!-- Body -->
    <div style="padding:36px 44px;">
      <p style="font-size:16px;color:#1a1a1a;margin:0 0 10px;">Dear ${name},</p>
      <p style="font-size:15px;color:#3a3a3a;line-height:1.7;margin:0 0 28px;">
        Use the code below to verify your enquiry. It is valid for <strong style="color:#1F3A2D;">5 minutes</strong>.
      </p>

      <!-- OTP Box -->
      <div style="background:#F6F4EF;border-left:4px solid #D8B56A;border-radius:2px;padding:24px;text-align:center;margin:0 0 28px;">
        <p style="font-family:'Courier New',monospace;font-size:42px;font-weight:700;letter-spacing:0.3em;color:#1F3A2D;margin:0;">${otp}</p>
        <p style="font-size:11px;color:#888;font-family:'Courier New',monospace;margin:12px 0 0;letter-spacing:0.1em;text-transform:uppercase;">Valid for 5 minutes</p>
      </div>

      <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
        If you did not request this, please ignore this email. Do not share this code with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="height:3px;background:linear-gradient(90deg,#1F3A2D,#D8B56A 35%,#c9a55a 65%,#1F3A2D);"></div>
    <div style="background:#1F3A2D;padding:20px 40px;text-align:center;">
      <p style="color:rgba(246,244,239,0.45);font-size:10px;font-family:'Courier New',monospace;margin:0;letter-spacing:0.05em;">
        Viramah Stay · Krishna Valley, Vrindavan, UP
      </p>
    </div>
  </div>
</body>
</html>`,
            headers: {
                "X-Priority": "1",
                "Importance": "high",
                "X-Mailer": "Viramah-OTP-v1",
            },
        });

        if (error) {
            console.error("[send-otp] Resend error:", error);
            otpStore.delete(cleanEmail); // Clean up on failure
            return NextResponse.json({ success: false, error: "Failed to send OTP. Please try again." }, { status: 500 });
        }

        console.log(`[send-otp] OTP sent to ${cleanEmail}`);
        return NextResponse.json({ success: true, message: "OTP sent to your email." });

    } catch (err) {
        console.error("[send-otp] Unexpected error:", err);
        return NextResponse.json({ success: false, error: "Something went wrong." }, { status: 500 });
    }
}
