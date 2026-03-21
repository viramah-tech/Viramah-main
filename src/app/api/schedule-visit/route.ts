import { NextRequest, NextResponse } from "next/server";

// ── Types ─────────────────────────────────────────────────────
interface ScheduleVisitPayload {
    fullName: string;
    email: string;
    mobile: string;
    visitDate: string;
    timeSlot: string;
    guests: string;
}

// ── Input Validation ──────────────────────────────────────────
function validate(body: unknown): { valid: true; data: ScheduleVisitPayload } | { valid: false; error: string } {
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

    if (!b.visitDate || typeof b.visitDate !== "string") {
        return { valid: false, error: "A visit date is required." };
    }

    if (!b.timeSlot || typeof b.timeSlot !== "string") {
        return { valid: false, error: "A time slot is required." };
    }

    return {
        valid: true,
        data: {
            fullName: (b.fullName as string).trim(),
            email: (b.email as string).trim().toLowerCase(),
            mobile: (b.mobile as string).trim(),
            visitDate: (b.visitDate as string).trim(),
            timeSlot: (b.timeSlot as string).trim(),
            guests: typeof b.guests === "string" ? b.guests.trim() : "1",
        },
    };
}

// ── POST /api/schedule-visit ──────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        // 1. Parse & validate
        const rawBody = await req.json().catch(() => null);
        const validation = validate(rawBody);

        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { fullName, email, mobile, visitDate, timeSlot, guests } = validation.data;

        // 2. Timestamp (IST)
        const submittedAt = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        // 3. Google Sheets (via Apps Script webhook)
        const sheetsUrl = process.env.GOOGLE_SHEET_SCHEDULE_VISIT_URL;
        let sheetsOk = false;

        if (sheetsUrl) {
            try {
                const sheetsPayload = {
                    fullName,
                    email,
                    mobile,
                    visitDate,
                    timeSlot,
                    guests,
                    submittedAt,
                    sourcePage: req.headers.get("referer") || "direct",
                    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
                };

                // Append as query params so they survive the POST→GET redirect
                const queryString = new URLSearchParams(
                    Object.entries(sheetsPayload).map(([k, v]) => [k, String(v)])
                ).toString();
                const urlWithParams = `${sheetsUrl}?${queryString}`;

                const sheetsRes = await fetch(urlWithParams, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sheetsPayload),
                    redirect: "follow",
                    signal: AbortSignal.timeout(10000),
                });

                const sheetsText = await sheetsRes.text();
                console.log(`[Schedule Visit] Sheets HTTP ${sheetsRes.status} →`, sheetsText.slice(0, 120));

                try {
                    const sheetsJson = JSON.parse(sheetsText) as Record<string, unknown>;
                    
                    // ── Duplicate check ───────────────────────────────────
                    if (sheetsJson.duplicate === true) {
                        console.log(`[Schedule Visit] Duplicate booking detected: ${email} for ${visitDate}`);
                        return NextResponse.json(
                            {
                                success: false,
                                duplicate: true,
                                error: "You already have a visit scheduled for this date. If you need to change it, please call us.",
                            },
                            { status: 409 }
                        );
                    }

                    sheetsOk = sheetsJson.success === true;
                } catch {
                    sheetsOk = sheetsRes.ok;
                }

                if (!sheetsOk) {
                    console.warn("[Schedule Visit] Sheets reported failure:", sheetsText);
                    return NextResponse.json(
                        { success: false, error: "We couldn't save your booking to our records. Please try again or call us." },
                        { status: 500 }
                    );
                }
            } catch (sheetsError) {
                console.error("[Schedule Visit] Failed to save:", sheetsError);
                return NextResponse.json(
                    { success: false, error: "Service temporarily unavailable. Please call us to schedule." },
                    { status: 503 }
                );
            }
        } else {
            console.warn("[Schedule Visit] GOOGLE_SHEET_SCHEDULE_VISIT_URL is not set.");
            return NextResponse.json(
                { success: false, error: "Configuration error. Please call us to schedule." },
                { status: 500 }
            );
        }

        console.log(`[Schedule Visit] ✓ Booking saved (sheets=${sheetsOk}) → ${email} on ${visitDate} at ${timeSlot}`);

        return NextResponse.json({
            success: true,
            sheetsOk,
        });

    } catch (error) {
        console.error("[/api/schedule-visit] Unexpected error:", error);
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
        service: "Viramah Schedule Visit API",
        timestamp: new Date().toISOString(),
        env: {
            sheetsConfigured: Boolean(process.env.GOOGLE_SHEET_SCHEDULE_VISIT_URL),
        },
    });
}
