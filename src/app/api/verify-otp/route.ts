import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import EnquiryReceiptEmail from "@/emails/EnquiryReceiptEmail";
import { otpStore } from "@/lib/otpStore";

function getResend(): Resend {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured.");
    return new Resend(key);
}

// ── Validator ──────────────────────────────────────────────────
interface VerifyOTPPayload {
    otp: string;
    fullName: string;
    email: string;
    mobile: string;
    city: string;
    state: string;
    country: string;
}

function validate(body: unknown): { valid: true; data: VerifyOTPPayload } | { valid: false; error: string } {
    if (typeof body !== "object" || body === null) return { valid: false, error: "Invalid request body." };
    const b = body as Record<string, unknown>;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!b.email || typeof b.email !== "string" || !emailRegex.test(b.email.trim())) {
        return { valid: false, error: "A valid email is required." };
    }
    if (!b.otp || typeof b.otp !== "string" || b.otp.trim().length !== 6) {
        return { valid: false, error: "OTP must be a 6-digit number." };
    }
    if (!b.fullName || typeof b.fullName !== "string" || b.fullName.trim().length < 2) {
        return { valid: false, error: "Full name is required." };
    }

    return {
        valid: true,
        data: {
            otp: b.otp.trim(),
            fullName: b.fullName.trim(),
            email: b.email.trim().toLowerCase(),
            mobile: typeof b.mobile === "string" ? b.mobile.trim() : "",
            city: typeof b.city === "string" ? b.city.trim() : "",
            state: typeof b.state === "string" ? b.state.trim() : "",
            country: typeof b.country === "string" ? b.country.trim() : "",
        },
    };
}

// ── POST /api/verify-otp ───────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.json().catch(() => null);
        const validation = validate(rawBody);

        if (!validation.valid) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
        }

        const { otp, fullName, email, mobile, city, state, country } = validation.data;

        // ── 1. Verify OTP ─────────────────────────────────────────
        const storedOTP = otpStore.get(email);

        if (!storedOTP) {
            return NextResponse.json({ success: false, error: "OTP expired or missing. Please request a new one." }, { status: 410 });
        }

        if (Date.now() > storedOTP.expiresAt) {
            otpStore.delete(email);
            return NextResponse.json({ success: false, error: "OTP expired. Please request a new one." }, { status: 410 });
        }

        if (storedOTP.attempts >= 3) {
            otpStore.delete(email);
            return NextResponse.json({ success: false, error: "Too many failed attempts. Please request a new OTP." }, { status: 429 });
        }

        if (storedOTP.otp !== otp) {
            storedOTP.attempts += 1;
            return NextResponse.json({ success: false, error: "Incorrect OTP." }, { status: 400 });
        }

        // OTP is valid! Remove it so it can't be reused
        otpStore.delete(email);

        // ── 2. Run existing enquiry submission logic ──────────────
        const submittedAt = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const sheetsUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
        let sheetsOk = false;

        if (sheetsUrl) {
            try {
                const sheetsPayload = {
                    fullName, email, mobile, city, state, country, submittedAt,
                    sourcePage: req.headers.get("referer") || "direct",
                    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
                };
                const queryString = new URLSearchParams(Object.entries(sheetsPayload).map(([k, v]) => [k, String(v)])).toString();

                const sheetsRes = await fetch(`${sheetsUrl}?${queryString}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sheetsPayload),
                    redirect: "follow",
                    signal: AbortSignal.timeout(10000),
                });

                const sheetsText = await sheetsRes.text();
                try {
                    const sheetsJson = JSON.parse(sheetsText);
                    if (sheetsJson.duplicate) {
                        return NextResponse.json({
                            success: false, duplicate: true,
                            error: "You have already enquired. Please check your inbox for the confirmation email we sent earlier."
                        }, { status: 409 });
                    }
                    sheetsOk = sheetsJson.success === true;
                } catch {
                    sheetsOk = sheetsRes.ok;
                }
            } catch (err) {
                console.error("[verify-otp] Sheets failed:", err);
            }
        }

        // ── 3. Try fetching brochure ──────────────────────────────
        let brochureBuffer: Buffer | undefined;
        let pNextAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://viramahstay.com";
        const brochureUrl = `${pNextAppUrl.replace(/\/$/, "")}/Viramah-Brochure-2026.pdf`;
        try {
            const pdfRes = await fetch(brochureUrl, { signal: AbortSignal.timeout(5000) });
            if (pdfRes.ok) brochureBuffer = Buffer.from(await pdfRes.arrayBuffer());
        } catch (err) {
            console.warn("[verify-otp] Brochure fetch failed", err);
        }

        // ── 4. Send Confirmation Email ────────────────────────────
        const emailHtml = await render(EnquiryReceiptEmail({ fullName, email, mobile, city, state, country, submittedAt }));

        let resend;
        try { resend = getResend(); } catch (e) {
            return NextResponse.json({ success: true, emailSent: false, sheetsOk, warning: "Enquiry saved. No email service." });
        }

        const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const emailPayload: Parameters<typeof resend.emails.send>[0] = {
            from: `Viramah Stay <${fromAddress}>`,
            to: [email],
            replyTo: fromAddress,
            subject: `Your enquiry confirmation — Viramah Stay`,
            html: emailHtml,
            headers: { "X-Priority": "1", "Importance": "high", "X-Mailer": "Viramah-Transactional-v1" },
            attachments: brochureBuffer ? [{ filename: "Viramah-Brochure-2026.pdf", content: brochureBuffer }] : undefined,
        };

        const emailResult = await resend.emails.send(emailPayload);
        if (emailResult.error) {
            return NextResponse.json({ success: true, emailSent: false, sheetsOk, warning: "Saved, but email failed." });
        }

        return NextResponse.json({ success: true, emailSent: true, sheetsOk, emailId: emailResult.data?.id });

    } catch (err) {
        console.error("[verify-otp] Unexpected error:", err);
        return NextResponse.json({ success: false, error: "Something went wrong." }, { status: 500 });
    }
}
