import {
    Body,
    Column,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Row,
    Section,
    Text,
    Link,
} from "@react-email/components";
import * as React from "react";

// ── Props ──────────────────────────────────────────────────────
export interface EnquiryReceiptEmailProps {
    fullName: string;
    email: string;
    mobile: string;
    city: string;
    state: string;
    country: string;
    submittedAt: string;
}

// ────────────────────────────────────────────────────────────────
// Primary-inbox safe rules followed:
//  ✓ Branded header is fine (Airbnb / Stripe do it — it's the CONTENT that matters)
//  ✓ No Resend campaign tags
//  ✓ No "Unsubscribe" / list-mail headers
//  ✓ Transactional subject line (no emojis, no "deals")
//  ✓ Mostly text-forward single-column layout
//  ✗ No big promotional CTA buttons
//  ✗ No "Sale", "Offer", "Discount" words in copy
// ────────────────────────────────────────────────────────────────

// Logo hosted on the live domain — email clients need a public URL
const LOGO_URL = "https://viramahstay.com/logo.png";
const BRAND_GREEN = "#1F3A2D";
const BRAND_GOLD = "#D8B56A";
const BRAND_CREAM = "#F6F4EF";

export default function EnquiryReceiptEmail({
    fullName = "there",
    email = "",
    mobile = "",
    city = "",
    state = "",
    country = "India",
    submittedAt = "",
}: EnquiryReceiptEmailProps) {
    const firstName = fullName.split(" ")[0];
    const location = [city, state, country].filter(Boolean).join(", ");

    return (
        <Html lang="en">
            <Head />
            <Preview>
                {firstName}, we received your Viramah enquiry — your confirmation and brochure are inside.
            </Preview>

            <Body style={body}>
                <Container style={outerContainer}>

                    {/* ════════════════════════════════════════════════
                        HEADER — dark green with centred logo + brand name
                    ════════════════════════════════════════════════ */}
                    <Section style={header}>

                        {/* Corner ornament lines */}
                        <Row>
                            <Column style={{ textAlign: "left", paddingLeft: 28, paddingTop: 20 }}>
                                <Text style={cornerOrnament}>—</Text>
                            </Column>
                            <Column style={{ textAlign: "right", paddingRight: 28, paddingTop: 20 }}>
                                <Text style={cornerOrnament}>—</Text>
                            </Column>
                        </Row>

                        {/* Logo */}
                        <Row>
                            <Column style={{ textAlign: "center" }}>
                                <Img
                                    src={LOGO_URL}
                                    width={72}
                                    height={72}
                                    alt="Viramah logo"
                                    style={{ display: "block", margin: "0 auto" }}
                                />
                            </Column>
                        </Row>

                        {/* Brand name */}
                        <Row>
                            <Column style={{ textAlign: "center", paddingTop: 12 }}>
                                <Text style={brandName}>Viramah stay.</Text>
                                <Text style={brandTagline}>Premium Student Living </Text>
                            </Column>
                        </Row>

                        {/* Bottom ornament row */}
                        <Row>
                            <Column style={{ textAlign: "center", paddingBottom: 24, paddingTop: 8 }}>
                                <Text style={ornamentDots}>✦ ✦ ✦</Text>
                            </Column>
                        </Row>

                    </Section>

                    {/* Gold accent bar */}
                    <div style={goldBar} />

                    {/* ════════════════════════════════════════════════
                        BODY
                    ════════════════════════════════════════════════ */}
                    <Section style={bodySection}>

                        {/* Greeting */}
                        <Text style={greeting}>Dear {firstName},</Text>
                        <Text style={para}>
                            Thank you for reaching out to us. We have received your
                            enquiry and a member of our team will contact you
                            <strong style={{ color: BRAND_GREEN }}>SOON</strong>.
                        </Text>
                        <Text style={para}>
                            We have attached our <strong style={{ color: BRAND_GREEN }}>Latest Brochure</strong>{" "}
                            to this email. It covers all our room categories, pricing,
                            amenities, and the community experience in detail.
                        </Text>

                        {/* ── Receipt Card ──────────────────────────── */}
                        <div style={receiptCard}>
                            <Text style={receiptHeading}>ENQUIRY RECEIPT</Text>

                            {/* Reference number style divider */}
                            <div style={goldLineAccent} />

                            <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                                {[
                                    { label: "Full Name", val: fullName },
                                    { label: "Email", val: email },
                                    { label: "Mobile", val: mobile },
                                    { label: "Location", val: location || "Not specified" },
                                    { label: "Received", val: `${submittedAt} IST` },
                                ].map(({ label, val }, i, arr) => (
                                    <React.Fragment key={label}>
                                        <tr>
                                            <td style={tdLabel}>{label}</td>
                                            <td style={tdValue}>{val}</td>
                                        </tr>
                                        {i < arr.length - 1 && (
                                            <tr>
                                                <td colSpan={2} style={{ padding: 0 }}>
                                                    <div style={rowDivider} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </table>
                        </div>

                        {/* ── What happens next ──────────────────────── */}
                        <Text style={subHeading}>What happens next</Text>
                        <div style={stepItem}>
                            <Text style={stepNum}>01</Text>
                            <Text style={stepText}>Our team will call you at <strong>{mobile || "the number provided"}</strong> to discuss your requirements.</Text>
                        </div>
                        <div style={stepItem}>
                            <Text style={stepNum}>02</Text>
                            <Text style={stepText}>We will help you choose the room type that best fits your budget and lifestyle.</Text>
                        </div>
                        <div style={stepItem}>
                            <Text style={stepNum}>03</Text>
                            <Text style={stepText}>If you would like to visit, we will arrange a personal walkthrough at your preferred time.</Text>
                        </div>

                        {/* ── Inline contact links ───────────────────── */}
                        <Hr style={sectionDivider} />
                        <Text style={para}>
                            Have questions in the meantime? Write to us at{" "}
                            <Link href="mailto:team@viramahstay.com" style={inlineLink}>team@viramahstay.com</Link>{" "}
                            or call{" "}
                            <Link href="tel:+918679001662" style={inlineLink}>+91 8679001662</Link>.
                        </Text>
                        <Text style={para}>
                            You can also explore our rooms at{" "}
                            <Link href="https://viramahstay.com/rooms" style={inlineLink}>viramahstay.com/rooms</Link>.
                        </Text>

                        {/* ── Sign off ─────────────────────────────────── */}
                        <Hr style={sectionDivider} />
                        <Text style={signoff}>Warmly,</Text>
                        <Text style={{ ...signoff, marginTop: -8, fontWeight: "700", color: BRAND_GREEN }}>The Viramah Team</Text>
                        <Text style={{ ...signoff, marginTop: -4, fontSize: "13px", color: "#888" }}>Krishna Valley, Vrindavan</Text>

                    </Section>

                    {/* Gold accent bar */}
                    <div style={goldBar} />

                    {/* ════════════════════════════════════════════════
                        FOOTER — dark green
                    ════════════════════════════════════════════════ */}
                    <Section style={footer}>

                        <Text style={footerBrand}>Viramah stay.</Text>
                        <Text style={footerAddress}>Krishna Valley, Vrindavan, Uttar Pradesh — India</Text>

                        <Text style={footerLinks}>
                            <Link href="https://viramahstay.com" style={footerLink}>viramahstay.com</Link>
                            <span style={{ color: BRAND_GOLD, padding: "0 6px" }}>·</span>
                            <Link href="mailto:team@viramahstay.com" style={footerLink}>team@viramahstay.com</Link>
                            <span style={{ color: BRAND_GOLD, padding: "0 6px" }}>·</span>
                            <Link href="tel:+918679001662" style={footerLink}>+91 8679001662</Link>
                        </Text>

                        <Text style={footerDisclaimer}>
                            You received this because you submitted an enquiry at viramahstay.com.
                            This is a transactional confirmation — not a marketing email.
                        </Text>

                    </Section>

                </Container>
            </Body>
        </Html>
    );
}

// ══════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════

const body: React.CSSProperties = {
    backgroundColor: "#ECEAE3",
    margin: 0,
    padding: "32px 0 48px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
};

const outerContainer: React.CSSProperties = {
    maxWidth: "580px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow: "0 8px 48px rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.08)",
};

// ── Header ────────────────────────────────────────────────────

const header: React.CSSProperties = {
    backgroundColor: BRAND_GREEN,
    padding: "0 40px",
};

const cornerOrnament: React.CSSProperties = {
    color: "rgba(216,181,106,0.35)",
    fontSize: "14px",
    fontFamily: "monospace",
    margin: 0,
    letterSpacing: "6px",
};

const brandName: React.CSSProperties = {
    color: BRAND_CREAM,
    fontSize: "26px",
    fontWeight: "400",
    margin: "0 0 6px",
    letterSpacing: "0.04em",
    textAlign: "center",
    fontFamily: "'Georgia', serif",
};

const brandTagline: React.CSSProperties = {
    color: BRAND_GOLD,
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.42em",
    margin: "0 0 4px",
    textAlign: "center",
    fontFamily: "'Courier New', monospace",
};

const ornamentDots: React.CSSProperties = {
    color: "rgba(216,181,106,0.5)",
    fontSize: "8px",
    letterSpacing: "8px",
    textAlign: "center",
    margin: 0,
};

const goldBar: React.CSSProperties = {
    height: "3px",
    background: `linear-gradient(90deg, ${BRAND_GREEN}, ${BRAND_GOLD} 35%, #c9a55a 65%, ${BRAND_GREEN})`,
};

// ── Body section ──────────────────────────────────────────────

const bodySection: React.CSSProperties = {
    padding: "36px 44px 32px",
};

const greeting: React.CSSProperties = {
    fontSize: "17px",
    color: "#1a1a1a",
    margin: "0 0 14px",
    fontFamily: "'Georgia', serif",
};

const para: React.CSSProperties = {
    fontSize: "15px",
    lineHeight: "1.72",
    color: "#3a3a3a",
    margin: "0 0 14px",
    fontFamily: "'Georgia', serif",
};

// ── Receipt card ──────────────────────────────────────────────

const receiptCard: React.CSSProperties = {
    backgroundColor: BRAND_CREAM,
    borderLeft: `4px solid ${BRAND_GOLD}`,
    borderRadius: "2px",
    padding: "22px 26px",
    margin: "24px 0",
};

const receiptHeading: React.CSSProperties = {
    color: BRAND_GOLD,
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.38em",
    fontFamily: "'Courier New', monospace",
    fontWeight: "700",
    margin: "0 0 10px",
};

const goldLineAccent: React.CSSProperties = {
    height: "1px",
    background: `linear-gradient(90deg, ${BRAND_GOLD}, transparent)`,
    marginBottom: "16px",
    opacity: 0.5,
};

const tdLabel: React.CSSProperties = {
    width: "100px",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(31,58,45,0.45)",
    fontFamily: "'Courier New', monospace",
    padding: "7px 0",
    verticalAlign: "top",
};

const tdValue: React.CSSProperties = {
    fontSize: "14px",
    color: BRAND_GREEN,
    fontFamily: "'Georgia', serif",
    padding: "7px 0",
    verticalAlign: "top",
};

const rowDivider: React.CSSProperties = {
    height: "1px",
    backgroundColor: "rgba(31,58,45,0.08)",
};

// ── Steps ─────────────────────────────────────────────────────

const subHeading: React.CSSProperties = {
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    textTransform: "uppercase",
    letterSpacing: "0.25em",
    color: BRAND_GREEN,
    fontWeight: "700",
    margin: "28px 0 16px",
    borderBottom: `1px solid rgba(31,58,45,0.12)`,
    paddingBottom: "10px",
};

const stepItem: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "10px",
};

const stepNum: React.CSSProperties = {
    color: BRAND_GOLD,
    fontFamily: "'Courier New', monospace",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    minWidth: "24px",
    margin: "2px 10px 0 0",
    display: "inline-block",
};

const stepText: React.CSSProperties = {
    fontSize: "14px",
    lineHeight: "1.65",
    color: "#444",
    margin: "0 0 4px",
    fontFamily: "'Georgia', serif",
    display: "inline",
};

const sectionDivider: React.CSSProperties = {
    borderColor: "rgba(31,58,45,0.1)",
    margin: "24px 0",
};

const inlineLink: React.CSSProperties = {
    color: BRAND_GREEN,
    textDecoration: "underline",
    fontWeight: "700",
};

const signoff: React.CSSProperties = {
    fontSize: "15px",
    color: "#3a3a3a",
    margin: "0 0 6px",
    fontFamily: "'Georgia', serif",
};

// ── Footer ────────────────────────────────────────────────────

const footer: React.CSSProperties = {
    backgroundColor: BRAND_GREEN,
    padding: "28px 44px 36px",
    textAlign: "center",
};

const footerBrand: React.CSSProperties = {
    color: BRAND_CREAM,
    fontSize: "17px",
    fontWeight: "400",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.05em",
    margin: "0 0 6px",
    textAlign: "center",
};

const footerAddress: React.CSSProperties = {
    color: "rgba(246,244,239,0.45)",
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.04em",
    margin: "0 0 14px",
    textAlign: "center",
};

const footerLinks: React.CSSProperties = {
    fontSize: "12px",
    margin: "0 0 18px",
    textAlign: "center",
    fontFamily: "'Courier New', monospace",
};

const footerLink: React.CSSProperties = {
    color: BRAND_GOLD,
    textDecoration: "none",
};

const footerDisclaimer: React.CSSProperties = {
    fontSize: "10px",
    color: "rgba(246,244,239,0.28)",
    fontFamily: "'Courier New', monospace",
    lineHeight: "1.6",
    margin: 0,
    textAlign: "center",
};
