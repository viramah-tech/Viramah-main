# Viramah — Enquiry Receipt System
## Comprehensive Implementation Plan

> **Goal:** When a visitor submits the enquiry form, two things must happen simultaneously:
> 1. Their data is saved to Google Sheets (already partially wired)
> 2. They receive a branded email receipt with the Viramah brochure attached

---

## 📦 Current State Audit

### What Exists
- `EnquiryModal.tsx` — The full form UI collecting: `fullName`, `mobile`, `email`, `city`, `state`, `country`
- `handleSubmit` — Already sending a `fetch` POST to a Google Apps Script URL (mode: `no-cors`)
- Apps Script webhook URL: `https://script.google.com/macros/s/AKfycby42eCg.../exec`
- `.env.example` has a `RESEND_API_KEY` placeholder commented out

### What's Missing
- No email sending logic anywhere in the codebase
- No Next.js API route for double-action (Sheets + Email simultaneously)
- No brochure PDF in the project
- The current `no-cors` POST means we cannot read the response back — we must change the architecture

---

## 🏗️ System Architecture (Post-Implementation)

```
User submits form
      │
      ▼
EnquiryModal.tsx
      │  POST /api/enquiry  (Next.js API Route)
      ▼
┌─────────────────────────────────────────────┐
│  /api/enquiry/route.ts  (Server Action)      │
│                                              │
│  ├── 1. Validate input (Zod)                 │
│  ├── 2. POST to Google Apps Script (Sheets)  │
│  └── 3. Send email via Resend                │
│         └── Branded HTML template            │
│         └── Brochure PDF attached            │
└─────────────────────────────────────────────┘
      │
      ▼
User sees success state + receives email
```

---

## 📋 Phase-by-Phase Implementation Plan

---

### PHASE 1 — Google Sheets (Upgrade Existing)

#### Current Problem
The current implementation uses `mode: "no-cors"` which means:
- We cannot read the response from Apps Script
- We don't know if it succeeded or failed
- We can't give accurate user feedback

#### Fix: Use a CORS-enabled Apps Script

**Step 1A: Update the Google Apps Script**

Replace your current Apps Script code with the following CORS-enabled version that handles both GET (verification) and POST (data):

```javascript
// Google Apps Script — paste in Tools > Script Editor
const SHEET_NAME = "Enquiries";

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Viramah webhook active" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email",
        "Mobile",
        "Country",
        "State",
        "City",
        "Source Page",
        "IP (approx)"
      ]);
      // Style the header row
      sheet.getRange(1, 1, 1, 9).setBackground("#1F3A2D").setFontColor("#D8B56A").setFontWeight("bold");
    }

    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.fullName   || "",
      data.email      || "",
      data.mobile     || "",
      data.country    || "",
      data.state      || "",
      data.city       || "",
      data.sourcePage || "website",
      data.ip         || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Lead captured" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

**Step 1B: Re-deploy the Apps Script**
1. In Apps Script editor: `Deploy > Manage Deployments > New Deployment`
2. Type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone** (required for cross-origin POST)
5. Copy the new deployment URL → put it in `.env.local` as `GOOGLE_SHEET_WEBHOOK_URL`

---

### PHASE 2 — Email Setup with Resend

**Why Resend?**
- Free tier: 3,000 emails/month, 100/day
- Native Next.js/Vercel support
- React Email component support (HTML templating)
- Excellent deliverability

#### Step 2A: Install Dependencies

```bash
npm install resend @react-email/components @react-email/render
```

#### Step 2B: Get API Key
1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys → Create Key
3. Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=team@viramah.com
```

> **Note:** You must verify your sending domain `viramah.com` in Resend's dashboard by adding DNS records.

---

### PHASE 3 — Brochure PDF

#### Option A: Upload existing brochure (Recommended)
Place your branded PDF brochure at:
```
/public/Viramah-Brochure-2026.pdf
```
This makes it accessible at `https://viramah.com/Viramah-Brochure-2026.pdf`

#### Option B: Generate programmatically (Advanced)
Use `@react-pdf/renderer` to generate a PDF on the fly — more complex, not needed for v1.

---

### PHASE 4 — Create the Email Template

**File:** `src/emails/EnquiryReceiptEmail.tsx`

```tsx
import {
  Body, Container, Head, Heading, Hr, Html, Img, Link,
  Preview, Section, Text, Row, Column, Button
} from "@react-email/components";

interface EnquiryReceiptEmailProps {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  country: string;
  submittedAt: string;
}

export default function EnquiryReceiptEmail({
  fullName,
  email,
  mobile,
  city,
  state,
  country,
  submittedAt,
}: EnquiryReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Viramah enquiry has been received — brochure inside</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>

          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>Viramah stay.</Heading>
            <Text style={taglineStyle}>Premium Student Living</Text>
          </Section>

          {/* Gold divider */}
          <Hr style={goldDivider} />

          {/* Greeting */}
          <Section style={contentSection}>
            <Heading style={h1Style}>
              Thank you, {fullName}.
            </Heading>
            <Text style={bodyText}>
              We've received your enquiry and you can expect a call from
              our team within <strong>24 hours</strong>. We're excited to
              show you what life at Viramah looks like.
            </Text>
          </Section>

          {/* Enquiry Summary Card */}
          <Section style={cardStyle}>
            <Text style={cardTitle}>ENQUIRY RECEIPT</Text>
            <Hr style={thinLine} />
            <Row>
              <Column style={labelCol}><Text style={labelText}>Name</Text></Column>
              <Column><Text style={valueText}>{fullName}</Text></Column>
            </Row>
            <Row>
              <Column style={labelCol}><Text style={labelText}>Email</Text></Column>
              <Column><Text style={valueText}>{email}</Text></Column>
            </Row>
            <Row>
              <Column style={labelCol}><Text style={labelText}>Mobile</Text></Column>
              <Column><Text style={valueText}>{mobile}</Text></Column>
            </Row>
            <Row>
              <Column style={labelCol}><Text style={labelText}>Location</Text></Column>
              <Column><Text style={valueText}>{city}, {state}, {country}</Text></Column>
            </Row>
            <Row>
              <Column style={labelCol}><Text style={labelText}>Received</Text></Column>
              <Column><Text style={valueText}>{submittedAt}</Text></Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={bodyText}>
              We've also attached our <strong>Viramah 2026 Brochure</strong> to
              this email. Take a look at our spaces, amenities, and pricing.
            </Text>
            <Button style={buttonStyle} href="https://viramah.com/rooms">
              Explore Living Options →
            </Button>
          </Section>

          {/* Property Highlights */}
          <Section style={highlightSection}>
            <Text style={cardTitle}>WHAT'S WAITING FOR YOU</Text>
            <Hr style={thinLine} />
            <Row>
              <Column style={{ padding: "8px 12px", textAlign: "center" }}>
                <Text style={statNumber}>₹10,499</Text>
                <Text style={statLabel}>Starting / Month</Text>
              </Column>
              <Column style={{ padding: "8px 12px", textAlign: "center" }}>
                <Text style={statNumber}>500+</Text>
                <Text style={statLabel}>Happy Residents</Text>
              </Column>
              <Column style={{ padding: "8px 12px", textAlign: "center" }}>
                <Text style={statNumber}>4.9★</Text>
                <Text style={statLabel}>Avg. Rating</Text>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Hr style={goldDivider} />
          <Section style={footerSection}>
            <Text style={footerText}>
              Viramah Stay · Krishna Valley, Vrindavan
            </Text>
            <Text style={footerText}>
              <Link href="https://viramah.com" style={footerLink}>viramah.com</Link>
              {" · "}
              <Link href="mailto:team@viramah.com" style={footerLink}>team@viramah.com</Link>
              {" · "}
              <Link href="tel:+918679001662" style={footerLink}>+91 8679001662</Link>
            </Text>
            <Text style={{ ...footerText, opacity: 0.5, fontSize: "10px" }}>
              You received this because you submitted an enquiry at viramah.com.
              This is a transactional email — no action required.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────

const bodyStyle = {
  backgroundColor: "#F6F4EF",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: "32px 0",
};

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const headerStyle = {
  backgroundColor: "#1F3A2D",
  padding: "40px 48px 32px",
  textAlign: "center" as const,
};

const logoStyle = {
  color: "#F6F4EF",
  fontSize: "28px",
  fontWeight: "400",
  margin: 0,
  letterSpacing: "0.02em",
};

const taglineStyle = {
  color: "#D8B56A",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.35em",
  margin: "8px 0 0",
  fontFamily: "'Courier New', monospace",
};

const goldDivider = {
  borderColor: "#D8B56A",
  borderWidth: "1px",
  margin: 0,
  opacity: 0.4,
};

const thinLine = {
  borderColor: "rgba(31,58,45,0.1)",
  borderWidth: "1px",
  margin: "12px 0",
};

const contentSection = { padding: "40px 48px 24px" };

const h1Style = {
  color: "#1F3A2D",
  fontSize: "32px",
  fontWeight: "400",
  lineHeight: "1.2",
  margin: "0 0 16px",
};

const bodyText = {
  color: "#444",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const cardStyle = {
  margin: "0 48px",
  padding: "24px",
  backgroundColor: "#F6F4EF",
  borderLeft: "3px solid #D8B56A",
  borderRadius: "2px",
};

const cardTitle = {
  color: "#D8B56A",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.3em",
  fontFamily: "'Courier New', monospace",
  margin: "0 0 12px",
};

const labelCol = { width: "100px" };

const labelText = {
  color: "rgba(31,58,45,0.5)",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
  fontFamily: "'Courier New', monospace",
  margin: "6px 0",
};

const valueText = {
  color: "#1F3A2D",
  fontSize: "14px",
  margin: "6px 0",
};

const ctaSection = { padding: "32px 48px" };

const buttonStyle = {
  backgroundColor: "#1F3A2D",
  color: "#D8B56A",
  padding: "14px 32px",
  fontSize: "12px",
  fontFamily: "'Courier New', monospace",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  textDecoration: "none",
  display: "inline-block",
  borderRadius: "2px",
};

const highlightSection = {
  margin: "0 48px 32px",
  padding: "24px",
  backgroundColor: "#1F3A2D",
  borderRadius: "4px",
};

const statNumber = {
  color: "#D8B56A",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 4px",
  textAlign: "center" as const,
};

const statLabel = {
  color: "rgba(246,244,239,0.6)",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
  fontFamily: "'Courier New', monospace",
  margin: 0,
  textAlign: "center" as const,
};

const footerSection = { padding: "24px 48px 40px", textAlign: "center" as const };

const footerText = {
  color: "#777",
  fontSize: "12px",
  margin: "4px 0",
};

const footerLink = { color: "#1F3A2D", textDecoration: "none" };
```

---

### PHASE 5 — Create the API Route

**File:** `src/app/api/enquiry/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import EnquiryReceiptEmail from "@/emails/EnquiryReceiptEmail";
import { readFileSync } from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Input validation ──────────────────────────────────────────
function validateInput(body: unknown): { valid: boolean; error?: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }
  const b = body as Record<string, unknown>;

  if (!b.fullName || typeof b.fullName !== "string" || b.fullName.trim().length < 2) {
    return { valid: false, error: "Full name is required" };
  }
  if (!b.email || typeof b.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
    return { valid: false, error: "Valid email is required" };
  }
  if (!b.mobile || typeof b.mobile !== "string" || b.mobile.trim().length < 7) {
    return { valid: false, error: "Valid mobile number is required" };
  }
  return { valid: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate
    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const { fullName, email, mobile, city, state, country } = body;

    // ── Timestamp (IST) ──────────────────────────────────────
    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "long",
      timeStyle: "short",
    });

    // ── 1. Send data to Google Sheets ────────────────────────
    const sheetsPromise = fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        mobile,
        city,
        state,
        country,
        submittedAt,
        sourcePage: req.headers.get("referer") || "website",
        ip: req.headers.get("x-forwarded-for") || "",
      }),
    }).catch((err) => {
      // Don't block email on Sheets failure — log only
      console.error("[Sheets] Failed to save lead:", err);
    });

    // ── 2. Read brochure PDF ─────────────────────────────────
    let brochureBuffer: Buffer | undefined;
    try {
      const brochurePath = path.join(process.cwd(), "public", "Viramah-Brochure-2026.pdf");
      brochureBuffer = readFileSync(brochurePath);
    } catch {
      console.warn("[Email] Brochure PDF not found — sending without attachment");
    }

    // ── 3. Render email HTML ─────────────────────────────────
    const emailHtml = await render(
      EnquiryReceiptEmail({ fullName, email, mobile, city, state, country, submittedAt })
    );

    // ── 4. Send email via Resend ─────────────────────────────
    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
      from: `Viramah Stay <${process.env.RESEND_FROM_EMAIL}>`,
      to: [email],
      subject: `Welcome to Viramah, ${fullName.split(" ")[0]} — Your Enquiry Receipt`,
      html: emailHtml,
      tags: [{ name: "category", value: "enquiry-receipt" }],
    };

    if (brochureBuffer) {
      emailPayload.attachments = [
        {
          filename: "Viramah-Brochure-2026.pdf",
          content: brochureBuffer,
        },
      ];
    }

    const emailPromise = resend.emails.send(emailPayload);

    // ── Run both in parallel ─────────────────────────────────
    const [, emailResult] = await Promise.all([sheetsPromise, emailPromise]);

    if (emailResult.error) {
      console.error("[Email] Resend error:", emailResult.error);
      // Still return success if sheets worked — don't punish user for email failure
      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: "Lead saved but email could not be sent.",
      });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      emailId: emailResult.data?.id,
    });

  } catch (error) {
    console.error("[/api/enquiry] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### PHASE 6 — Update EnquiryModal.tsx

**Change the `handleSubmit` function** inside `EnquiryModal.tsx` — remove the direct Google Sheets call and replace with the new internal API route:

```typescript
// Replace the entire handleSubmit function (lines ~439-477) with:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Submission failed");
    }

    setIsSubmitting(false);
    localStorage.setItem("viramah_enquiry_data_submitted", "true");
    setSubmitted(true);

    // Update success message to mention email
    // (change the success state text in JSX — see Phase 7)

    setTimeout(() => {
      setSubmitted(false);
      setForm(INITIAL_FORM);
      setIsOpen(false);
    }, 3500); // Give more time since email is mentioned

  } catch (error) {
    console.error("Submission failed:", error);
    setIsSubmitting(false);
    alert("Something went wrong. Please try again or call us at +91 8679001662.");
  }
};
```

---

### PHASE 7 — Update Success State in Modal

**Change the success state JSX** (around line 699–710) to mention the email:

```tsx
{/* Replace the success message text */}
<h3 style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.8rem", color: "#2d2b28", marginBottom: 8 }}>
  Sent!
</h3>
<p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "#6b5526", letterSpacing: "0.1em", lineHeight: 1.7 }}>
  Check your inbox for a confirmation + brochure.<br />
  Our team will call within 24 hours.
</p>
```

---

### PHASE 8 — Environment Variables

**Update `.env.local`** with all required variables:

```env
# ── Enquiry System ─────────────────────────────────────────────

# Resend email service (get from resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# The verified sender email (must match domain verified in Resend)
RESEND_FROM_EMAIL=team@viramah.com

# Google Apps Script webhook URL (re-deploy with CORS-enabled code)
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec
```

**Update `.env.example`** to document the new variables:

```env
# ── Enquiry Receipt System ─────────────────────────────────────
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=team@viramah.com
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

### PHASE 9 — Vercel Environment Variables

In the Vercel dashboard:
1. Project → Settings → Environment Variables
2. Add all three variables above for **Production** environment
3. Also add for **Preview** if testing on preview deployments

---

## 📁 Final File Structure After Implementation

```
src/
├── app/
│   └── api/
│       └── enquiry/
│           └── route.ts          ← NEW: The dual-action API endpoint
├── emails/
│   └── EnquiryReceiptEmail.tsx   ← NEW: Branded email template
└── components/
    └── ui/
        └── EnquiryModal.tsx      ← MODIFIED: handleSubmit + success state

public/
└── Viramah-Brochure-2026.pdf     ← ADD: Your brochure PDF here

.env.local                         ← ADD: 3 new env vars
.env.example                       ← UPDATE: Document new vars
```

---

## 🔄 Data Flow Summary

```
User fills form → clicks "Send Dispatch"
    │
    ▼
[EnquiryModal] POST to /api/enquiry
    │
    ▼
[/api/enquiry/route.ts]
    ├── Validates input (server-side)
    ├── Runs in parallel:
    │   ├── POST → Google Apps Script → Saves row to Sheet
    │   └── Resend API:
    │       ├── Renders HTML email from React template
    │       ├── Attaches Viramah-Brochure-2026.pdf
    │       └── Sends to user's email
    │
    └── Returns { success: true, emailSent: true }
    │
    ▼
[EnquiryModal] Shows success state
"Check your inbox for a confirmation + brochure."
```

---

## 📊 Google Sheet Column Layout (After Update)

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp (IST) | Full Name | Email | Mobile | Country | State | City | Source Page | IP |

Row 1 will be **auto-styled** with the Viramah dark green header + gold text.

---

## ⚡ Implementation Order (Suggested)

```
Day 1:
  ✅ Step 1 — Update + redeploy Google Apps Script (CORS fix)
  ✅ Step 2 — Set up Resend account, verify viramah.com domain
  ✅ Step 3 — Place brochure PDF in /public/

Day 2:
  ✅ Step 4 — Create src/emails/EnquiryReceiptEmail.tsx
  ✅ Step 5 — Install npm packages (resend, @react-email/components)
  ✅ Step 6 — Create src/app/api/enquiry/route.ts

Day 3:
  ✅ Step 7 — Update EnquiryModal.tsx (handleSubmit + success state)
  ✅ Step 8 — Add .env.local variables
  ✅ Step 9 — Test locally (npm run dev)
  ✅ Step 10 — Deploy to Vercel + add env vars in dashboard
  ✅ Step 11 — Test production form end-to-end
```

---

## 🛡️ Security Considerations

| Concern | Mitigation |
|---|---|
| Spam submissions | Add server-side rate limiting (1 req/IP per 5 minutes) |
| Bot abuse | Consider adding a honeypot field (hidden form field) |
| Email harvesting | Never expose the Resend API key client-side |
| Apps Script URL | It's public-facing — acceptable since output is a Sheet, not sensitive data |
| Large brochure | Keep the PDF under 5MB for reliable email delivery |

---

## 🧪 Testing Checklist

Before going live verify:
- [ ] Submit form → row appears in Google Sheet within 5 seconds
- [ ] Submit form → email arrives in Gmail inbox (not spam) within 2 minutes
- [ ] Email has correct name, location, timestamp
- [ ] Brochure PDF opens correctly from email attachment
- [ ] Form works on mobile (iOS Safari + Android Chrome)
- [ ] Form works without JavaScript (graceful degradation)
- [ ] Invalid email address is rejected before submission
- [ ] Success state shows "check your inbox" message

---

## 💰 Cost Analysis

| Service | Free Tier | Estimated Usage | Cost |
|---|---|---|---|
| Resend | 3,000 emails/month | ~50-200 enquiries/month | **FREE** |
| Google Sheets | Unlimited (personal) | Negligible | **FREE** |
| Vercel | Serverless functions included | ~200 invocations/month | **FREE** |
| **Total** | | | **₹0/month** |

---

*Prepared for Viramah Stay — February 2026*
