"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, FileText, Lock, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import {
    StepBadge, StepTitle, StepSubtitle, FormCard,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD  = "#D8B56A";

const TERMS_VERSION   = "v1.0";
const PRIVACY_VERSION = "v1.0";

// ── Scrollable Document Box ───────────────────────────────────────────────────

function ScrollableDoc({
    title,
    icon: Icon,
    children,
    onScrollProgress,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    onScrollProgress: (pct: number) => void;
}) {
    const boxRef         = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);

    const handleScroll = useCallback(() => {
        const el = boxRef.current;
        if (!el) return;
        const pct = el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
        onScrollProgress(pct * 100);
        if (pct >= 0.1) setScrolled(true);
    }, [onScrollProgress]);

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon size={16} color={GREEN} />
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, color: GREEN }}>{title}</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.4)", marginLeft: "auto" }}>
                    {TERMS_VERSION}
                </span>
            </div>

            {/* Scrollable box */}
            <div style={{ position: "relative" }}>
                <div
                    ref={boxRef}
                    onScroll={handleScroll}
                    style={{
                        maxHeight: 280,
                        overflowY: "scroll",
                        border: "1px solid rgba(31,58,45,0.12)",
                        borderRadius: 10,
                        padding: "16px 18px",
                        background: "rgba(31,58,45,0.02)",
                        fontFamily: "var(--font-body, sans-serif)",
                        fontSize: "0.82rem",
                        color: "rgba(31,58,45,0.75)",
                        lineHeight: 1.65,
                    }}
                >
                    {children}
                </div>

                {/* Scroll-to-read fader — fades once user has scrolled at all */}
                {!scrolled && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: scrolled ? 0 : 1 }}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 56,
                            background: "linear-gradient(transparent, rgba(247,241,232,0.96))",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            paddingBottom: 8,
                            borderRadius: "0 0 10px 10px",
                            pointerEvents: "none",
                        }}
                    >
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            ↓ Scroll to read
                        </span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// ── Checkbox with scroll warning ──────────────────────────────────────────────

function ConsentCheckbox({
    id,
    label,
    checked,
    onChange,
    scrollPct,
}: {
    id: string;
    label: React.ReactNode;
    checked: boolean;
    onChange: (v: boolean) => void;
    scrollPct: number;
}) {
    const handleChange = () => {
        onChange(!checked);
    };

    return (
        <div>
            <div
                onClick={handleChange}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", userSelect: "none" }}
            >
                <div
                    style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                        border: `2px solid ${checked ? GREEN : "rgba(31,58,45,0.25)"}`,
                        background: checked ? GREEN : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                    }}
                >
                    {checked && <CheckCircle size={12} color={GOLD} strokeWidth={3} />}
                </div>
                <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem", color: "rgba(31,58,45,0.8)", lineHeight: 1.5 }}>{label}</span>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TermsAndConditionsPage() {
    const router     = useRouter();
    const { showToast } = useToast();

    const [termsChecked,   setTermsChecked]   = useState(false);
    const [privacyChecked, setPrivacyChecked] = useState(false);
    const [termsScroll,    setTermsScroll]    = useState(0);
    const [privacyScroll,  setPrivacyScroll]  = useState(0);
    const [submitting,     setSubmitting]     = useState(false);

    const bothChecked = termsChecked && privacyChecked;

    const handleAccept = async () => {
        if (!bothChecked || submitting) return;
        setSubmitting(true);
        try {
            await apiFetch("/api/public/auth/accept-terms", {
                method: "POST",
                body: { termsVersion: TERMS_VERSION, privacyPolicyVersion: PRIVACY_VERSION },
            });
            // Store acceptance in localStorage for UX (source of truth is backend)
            localStorage.setItem("viramah_terms", JSON.stringify({
                termsAccepted: true,
                acceptedAt: new Date().toISOString(),
            }));
            showToast("Terms accepted. Welcome to Viramah!", "success");
            router.push("/user-onboarding/step-1");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to record acceptance. Please try again.";
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 48 }}
        >
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Shield} label="Legal Agreements" />
                <StepTitle>Before we continue — please review our policies</StepTitle>
                <StepSubtitle>
                    You must accept both documents to proceed with your registration.
                </StepSubtitle>
            </motion.div>

            {/* Terms & Conditions */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <ScrollableDoc title="Terms & Conditions" icon={FileText} onScrollProgress={setTermsScroll}>
                        <TermsContent />
                    </ScrollableDoc>
                    <div style={{ borderTop: "1px solid rgba(31,58,45,0.07)", paddingTop: 14, marginTop: 14 }}>
                        <ConsentCheckbox
                            id="terms-cb"
                            label={<>I have read and agree to the <strong>Terms &amp; Conditions</strong> ({TERMS_VERSION})</>}
                            checked={termsChecked}
                            onChange={setTermsChecked}
                            scrollPct={termsScroll}
                        />
                    </div>
                </FormCard>
            </motion.div>

            {/* Privacy Policy */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <ScrollableDoc title="Privacy Policy" icon={Lock} onScrollProgress={setPrivacyScroll}>
                        <PrivacyContent />
                    </ScrollableDoc>
                    <div style={{ borderTop: "1px solid rgba(31,58,45,0.07)", paddingTop: 14, marginTop: 14 }}>
                        <ConsentCheckbox
                            id="privacy-cb"
                            label={<>I have read and agree to the <strong>Privacy Policy</strong> ({PRIVACY_VERSION})</>}
                            checked={privacyChecked}
                            onChange={setPrivacyChecked}
                            scrollPct={privacyScroll}
                        />
                    </div>
                </FormCard>
            </motion.div>

            {/* Accept Button */}
            <motion.div variants={itemVariants} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                    onClick={handleAccept}
                    disabled={!bothChecked || submitting}
                    style={{
                        width: "100%",
                        padding: "18px 28px",
                        borderRadius: 14,
                        border: "none",
                        background: bothChecked && !submitting
                            ? `linear-gradient(135deg, ${GREEN} 0%, #162b1e 100%)`
                            : "rgba(31,58,45,0.1)",
                        color: bothChecked && !submitting ? GOLD : "rgba(31,58,45,0.3)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        cursor: bothChecked && !submitting ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        transition: "all 0.35s ease",
                        boxShadow: bothChecked && !submitting ? "0 8px 28px rgba(31,58,45,0.22)" : "none",
                    }}
                >
                    {submitting ? (
                        <>
                            <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                            Recording acceptance…
                        </>
                    ) : (
                        <>
                            Accept &amp; Continue to Registration
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
                {!bothChecked && (
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.57rem", color: "rgba(31,58,45,0.35)", textAlign: "center", margin: 0 }}>
                        Both checkboxes must be checked to proceed
                    </p>
                )}
                <button
                    onClick={() => router.push("/signup")}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                        color: "rgba(31,58,45,0.4)", textDecoration: "underline",
                        textAlign: "center", letterSpacing: "0.05em",
                    }}
                >
                    <ArrowLeft size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                    Back to Sign Up
                </button>
            </motion.div>
        </motion.div>
    );
}

// ── Terms & Conditions Content ────────────────────────────────────────────────

function TermsContent() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p><strong>Last updated:</strong> March 2026 &nbsp;·&nbsp; <strong>Version:</strong> v1.0</p>

            <Section title="1. Acceptance of Terms">
                By creating a Viramah account and proceeding through onboarding, you agree to be bound by these Terms & Conditions. If you do not agree, do not proceed with registration.
            </Section>

            <Section title="2. Eligibility">
                You must be at least 18 years old to register. By registering you confirm you meet this requirement and that all information provided is accurate.
            </Section>

            <Section title="3. Booking & Deposit Policy">
                <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                    <li>A ₹15,000 security deposit is required to hold your room.</li>
                    <li>The deposit is refundable in full within 7 days of admin approval.</li>
                    <li>After 7 days the deposit is non-refundable.</li>
                    <li>You must complete full payment within 21 days of approval or your room is released and the deposit is forfeited.</li>
                    <li>Viramah reserves the right to reject any reservation without liability.</li>
                </ul>
            </Section>

            <Section title="4. Payment">
                All payments are processed in Indian Rupees (INR). Published prices include 12% GST. Viramah reserves the right to update pricing with 30 days' notice.
            </Section>

            <Section title="5. Room Allocation">
                Room numbers are assigned by management after full payment is confirmed. A specific room number is not guaranteed at the time of booking.
            </Section>

            <Section title="6. House Rules">
                Residents must comply with Viramah's house rules communicated at move-in. Violation may result in immediate termination of residency without refund of any remaining tenure amount.
            </Section>

            <Section title="7. Intellectual Property">
                All content on the Viramah platform is owned by Viramah Student Living Pvt Ltd. Unauthorised reproduction is prohibited.
            </Section>

            <Section title="8. Limitation of Liability">
                To the maximum extent permitted by law, Viramah is not liable for indirect, incidental, or consequential damages arising from use of our services.
            </Section>

            <Section title="9. Governing Law">
                These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Mathura, Uttar Pradesh.
            </Section>

            <Section title="10. Contact">
                For any questions regarding these terms, contact us at <strong>legal@viramah.com</strong>.
            </Section>
        </div>
    );
}

// ── Privacy Policy Content ─────────────────────────────────────────────────────

function PrivacyContent() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p><strong>Last updated:</strong> March 2026 &nbsp;·&nbsp; <strong>Version:</strong> v1.0</p>

            <Section title="1. Data We Collect">
                <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                    <li>Personal information: name, email, phone, date of birth, gender, address.</li>
                    <li>Identity documents: Aadhaar, Passport, or other government ID.</li>
                    <li>Emergency contact information.</li>
                    <li>Payment information: transaction IDs and receipt images (no card numbers stored).</li>
                    <li>Technical data: IP address, browser type, device information.</li>
                    <li>Acceptance records: timestamp and IP at time of T&C/Privacy Policy acceptance.</li>
                </ul>
            </Section>

            <Section title="2. How We Use Your Data">
                <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                    <li>Processing your room booking and onboarding.</li>
                    <li>Identity verification and fraud prevention.</li>
                    <li>Communication regarding your residency.</li>
                    <li>Compliance with legal and regulatory obligations.</li>
                    <li>Improving our services through anonymised analytics.</li>
                </ul>
            </Section>

            <Section title="3. Data Sharing">
                We do not sell your personal data. We may share data with: (a) trusted payment processors to verify transactions; (b) government authorities when required by law; (c) service providers operating on our behalf under strict confidentiality agreements.
            </Section>

            <Section title="4. Data Retention">
                We retain your personal data for the duration of your residency and for up to 5 years thereafter for legal and accounting purposes.
            </Section>

            <Section title="5. Your Rights">
                You have the right to access, correct, or request deletion of your personal data. Contact <strong>privacy@viramah.com</strong>. Note that some data may be retained for legal compliance even after deletion requests.
            </Section>

            <Section title="6. Security">
                We implement industry-standard security measures including HTTPS, encrypted storage, and access controls. No system is fully secure; we encourage you to use a strong, unique password.
            </Section>

            <Section title="7. Cookies">
                We use cookies for session management and analytics. You may disable cookies in your browser settings, which may affect some functionality.
            </Section>

            <Section title="8. Children's Privacy">
                Our service is not directed to persons under 18. We do not knowingly collect data from minors.
            </Section>

            <Section title="9. Changes to This Policy">
                We will notify you of material changes to this Privacy Policy by email and by updating the version number on this page.
            </Section>

            <Section title="10. Contact">
                Data Controller: Viramah Student Living Pvt Ltd. Email: <strong>privacy@viramah.com</strong>.
            </Section>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p style={{ fontFamily: "var(--font-body, sans-serif)", fontWeight: 700, fontSize: "0.85rem", color: "#1F3A2D", marginBottom: 4 }}>{title}</p>
            <div style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", color: "rgba(31,58,45,0.72)", lineHeight: 1.65 }}>{children}</div>
        </div>
    );
}
