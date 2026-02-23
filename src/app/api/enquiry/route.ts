import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import EnquiryReceiptEmail from "@/emails/EnquiryReceiptEmail";
import { readFileSync } from "fs";
import path from "path";

// ── Resend client — lazy init inside handler so missing key ────
// ── doesn't crash the module at compile time ───────────────────
function getResend(): Resend {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        throw new Error("RESEND_API_KEY is not configured in environment variables.");
    }
    return new Resend(key);
}

// ── Types ─────────────────────────────────────────────────────
interface EnquiryPayload {
    fullName: string;
    email: string;
    mobile: string;
    city: string;
    state: string;
    country: string;
}

// ── Input Validation ──────────────────────────────────────────
function validate(body: unknown): { valid: true; data: EnquiryPayload } | { valid: false; error: string } {
    if (typeof body !== "object" || body === null) {
        return { valid: false, error: "Invalid request body." };
    }

    const b = body as Record<string, unknown>;

    if (!b.fullName || typeof b.fullName !== "string" || b.fullName.trim().length < 2) {
        return { valid: false, error: "Full name is required (min 2 characters)." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!b.email || typeof b.email !== "string" || !emailRegex.test(b.email.trim())) {
        return { valid: false, error: "A valid email address is required." };
    }

    if (!b.mobile || typeof b.mobile !== "string" || b.mobile.trim().length < 7) {
        return { valid: false, error: "A valid mobile number is required." };
    }

    return {
        valid: true,
        data: {
            fullName: (b.fullName as string).trim(),
            email: (b.email as string).trim().toLowerCase(),
            mobile: (b.mobile as string).trim(),
            city: typeof b.city === "string" ? b.city.trim() : "",
            state: typeof b.state === "string" ? b.state.trim() : "",
            country: typeof b.country === "string" ? b.country.trim() : "",
        },
    };
}

// ── POST /api/enquiry ─────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        // ── 1. Parse & validate ───────────────────────────────────
        const rawBody = await req.json().catch(() => null);
        const validation = validate(rawBody);

        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { fullName, email, mobile, city, state, country } = validation.data;

        // ── 2. Timestamp (IST) ────────────────────────────────────
        const submittedAt = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        // ── 3. Google Sheets — fire-and-forget ───────────────────
        const sheetsUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
        let sheetsOk = false;

        if (sheetsUrl) {
            try {
                // Run without awaiting — we'll track via Promise.allSettled below
                const sheetsPayload = {
                    fullName,
                    email,
                    mobile,
                    city,
                    state,
                    country,
                    submittedAt,
                    sourcePage: req.headers.get("referer") || "direct",
                    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
                };

                const sheetsRes = await fetch(sheetsUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sheetsPayload),
                    signal: AbortSignal.timeout(8000), // 8s timeout
                });

                sheetsOk = sheetsRes.ok;
                if (!sheetsRes.ok) {
                    console.warn("[Sheets] Response not OK:", await sheetsRes.text());
                }
            } catch (sheetsError) {
                // Log but don't fail — email is the primary user-facing action
                console.error("[Sheets] Failed to save lead:", sheetsError);
            }
        } else {
            console.warn("[Sheets] GOOGLE_SHEET_WEBHOOK_URL is not configured.");
        }

        // ── 4. Try to load brochure PDF ───────────────────────────
        let brochureBuffer: Buffer | undefined;
        const brochurePath = path.join(process.cwd(), "public", "Viramah-Brochure-2026.pdf");
        try {
            brochureBuffer = readFileSync(brochurePath);
        } catch {
            // PDF not yet placed — send email without attachment
            console.warn("[Email] Brochure PDF not found at:", brochurePath);
        }

        // ── 5. Render email HTML ──────────────────────────────────
        const emailHtml = await render(
            EnquiryReceiptEmail({ fullName, email, mobile, city, state, country, submittedAt })
        );

        // ── 6. Get Resend client (lazy — will not crash on serve if key missing) ──
        let resend: Resend;
        try {
            resend = getResend();
        } catch (configError) {
            console.error("[Email] Resend not configured:", configError);
            // Sheets already saved — return partial success
            return NextResponse.json({
                success: true,
                emailSent: false,
                sheetsOk,
                warning: "Enquiry saved. Email service is not yet configured — our team will still contact you.",
            });
        }

        // ── 7. Send email via Resend ──────────────────────────────
        const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const firstName = fullName.split(" ")[0];

        type EmailPayload = Parameters<typeof resend.emails.send>[0];
        const emailPayload: EmailPayload = {
            from: `Viramah Stay <${fromAddress}>`,
            to: [email],
            replyTo: fromAddress,
            // Subject: personal/transactional tone — avoids Promotions filter
            subject: `Your enquiry confirmation — Viramah Stay`,
            html: emailHtml,

            // ── Headers that signal "transactional / high priority" to Gmail ──
            // ── DO NOT add tags here — Resend tags mark emails as campaigns ────
            headers: {
                "X-Priority": "1",
                "Importance": "high",
                "X-Mailer": "Viramah-Transactional-v1",
                // Precedence: bulk would send to Promotions — we explicitly avoid it
            },
        };

        if (brochureBuffer) {
            emailPayload.attachments = [
                { filename: "Viramah-Brochure-2026.pdf", content: brochureBuffer },
            ];
        }

        void firstName; // used in template, not needed here after subject simplification

        const emailResult = await resend.emails.send(emailPayload);

        if (emailResult.error) {
            console.error("[Email] Resend error:", emailResult.error);

            // If sheets worked but email failed — still consider partial success
            return NextResponse.json({
                success: true,
                emailSent: false,
                sheetsOk,
                warning: "Your enquiry was saved but the confirmation email could not be sent. Our team will still contact you.",
            });
        }

        // ── 7. All good ───────────────────────────────────────────
        console.log(`[Enquiry] ✓ Lead saved (sheets=${sheetsOk}) + email sent (id=${emailResult.data?.id}) → ${email}`);

        return NextResponse.json({
            success: true,
            emailSent: true,
            sheetsOk,
            emailId: emailResult.data?.id,
        });

    } catch (error) {
        console.error("[/api/enquiry] Unexpected error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

// ── Health check ──────────────────────────────────────────────
export async function GET() {
    return NextResponse.json({
        status: "ok",
        service: "Viramah Enquiry API",
        timestamp: new Date().toISOString(),
        env: {
            resendConfigured: Boolean(process.env.RESEND_API_KEY),
            sheetsConfigured: Boolean(process.env.GOOGLE_SHEET_WEBHOOK_URL),
        },
    });
}
