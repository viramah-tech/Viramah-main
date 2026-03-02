import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import "@/styles/privacy-page.css";

export const metadata: Metadata = {
    title: "Privacy Policy | Viramah — Premium Student Living",
    description:
        "Read Viramah's Privacy Policy. We are committed to protecting your personal data with full transparency on how we collect, use, and safeguard your information.",
};

const KEY_POINTS = [
    {
        icon: "🔒",
        title: "Data Security",
        desc: "Your personal information is encrypted and stored securely. We never sell your data to third parties under any circumstances.",
        tag: "Security",
    },
    {
        icon: "👁️",
        title: "Transparency",
        desc: "We clearly explain what data we collect, why we collect it, and how it is used — no hidden clauses, no fine print surprises.",
        tag: "Clarity",
    },
    {
        icon: "✋",
        title: "Your Rights",
        desc: "You can request access, correction, or deletion of your personal data at any time by contacting our support team.",
        tag: "Control",
    },
    {
        icon: "🍪",
        title: "Cookies & Tracking",
        desc: "We use cookies only for essential site functionality and analytics to improve your experience. You can opt-out anytime.",
        tag: "Tracking",
    },
    {
        icon: "📧",
        title: "Communications",
        desc: "We only send you emails and notifications you have opted into. Unsubscribe from any communication at any time.",
        tag: "Opt-in Only",
    },
    {
        icon: "🔄",
        title: "Policy Updates",
        desc: "If our privacy policy changes in a material way, we will notify you via email and update the effective date on this page.",
        tag: "Up to Date",
    },
];

const PDF_PATH = "/PRIVACY%20POLICY.pdf";

export default function PrivacyPolicyPage() {
    return (
        <main className="pp-page">
            <Navigation />

            {/* ── Hero ── */}
            <section className="pp-hero">
                <div className="pp-hero-grain" aria-hidden="true" />
                <div className="pp-hero-bg-text" aria-hidden="true">PRIVACY</div>

                <div className="pp-hero-inner">
                    <span className="pp-eyebrow">Legal — Effective March 2025</span>

                    <h1 className="pp-hero-title">
                        Your Privacy,<br />
                        <span>Our&nbsp;Commitment.</span>
                    </h1>

                    <div className="pp-hero-meta">
                        <div className="pp-hero-meta-item">
                            <span className="pp-meta-label">Document</span>
                            <span className="pp-meta-value">Privacy Policy</span>
                        </div>
                        <div className="pp-hero-meta-item">
                            <span className="pp-meta-label">Governing Law</span>
                            <span className="pp-meta-value">India (IT Act, 2000)</span>
                        </div>
                        <div className="pp-hero-meta-item">
                            <span className="pp-meta-label">Last Updated</span>
                            <span className="pp-meta-value">March 2025</span>
                        </div>

                        <a
                            href={PDF_PATH}
                            download="Viramah-Privacy-Policy.pdf"
                            className="pp-hero-download"
                            aria-label="Download Privacy Policy PDF"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download PDF
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Key Highlights ── */}
            <section className="pp-summary-section">
                <div className="pp-summary-inner">
                    <header className="pp-summary-header">
                        <span className="pp-summary-eyebrow">At a Glance</span>
                        <h2 className="pp-summary-title">
                            What our privacy<br />policy covers.
                        </h2>
                    </header>

                    <div className="pp-summary-grid">
                        {KEY_POINTS.map((point) => (
                            <div key={point.title} className="pp-summary-card">
                                <span className="pp-summary-card-icon">{point.icon}</span>
                                <h3 className="pp-summary-card-title">{point.title}</h3>
                                <p className="pp-summary-card-desc">{point.desc}</p>
                                <span className="pp-summary-card-tag">{point.tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PDF Viewer ── */}
            <section className="pp-viewer-section">
                <div className="pp-viewer-inner">
                    <div className="pp-viewer-card">

                        {/* Chrome-style top bar */}
                        <div className="pp-viewer-topbar">
                            <div className="pp-viewer-dots" aria-hidden="true">
                                <span className="pp-viewer-dot" />
                                <span className="pp-viewer-dot" />
                                <span className="pp-viewer-dot" />
                            </div>
                            <span className="pp-viewer-label">Viramah — Privacy Policy.pdf</span>
                            <div className="pp-viewer-actions">
                                <a
                                    href={PDF_PATH}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pp-action-btn outline"
                                    aria-label="Open PDF in new tab"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                    Open
                                </a>
                                <a
                                    href={PDF_PATH}
                                    download="Viramah-Privacy-Policy.pdf"
                                    className="pp-action-btn gold"
                                    aria-label="Download Privacy Policy PDF"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download
                                </a>
                            </div>
                        </div>

                        {/* PDF viewer — direct iframe to the PDF file.
                            Chrome, Edge, Firefox and Safari all have built-in PDF viewers
                            that render this natively. The fallback shows open/download links. */}
                        <div className="pp-pdf-wrapper">
                            <iframe
                                src={PDF_PATH}
                                className="pp-pdf-embed"
                                title="Viramah Privacy Policy"
                                aria-label="Viramah Privacy Policy PDF Document"
                            />
                            {/* Accessible fallback for environments with no PDF plugin */}
                            <div className="pp-pdf-noplugin">
                                <span className="pp-pdf-noplugin-icon">📄</span>
                                <p className="pp-pdf-noplugin-title">Inline Preview Not Available</p>
                                <p className="pp-pdf-noplugin-sub">Your browser cannot display this PDF inline.</p>
                                <div className="pp-pdf-noplugin-btns">
                                    <a href={PDF_PATH} target="_blank" rel="noopener noreferrer" className="pp-action-btn gold">
                                        Open PDF
                                    </a>
                                    <a href={PDF_PATH} download="Viramah-Privacy-Policy.pdf" className="pp-action-btn outline" style={{ borderColor: "rgba(26,51,40,0.3)", color: "#1a3328" }}>
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA strip */}
                        <div className="pp-cta-strip">
                            <div className="pp-cta-strip-text">
                                <span className="pp-cta-strip-title">Questions about our Privacy Policy?</span>
                                <span className="pp-cta-strip-sub">Reach out — we&apos;re happy to clarify.</span>
                            </div>
                            <a
                                href="mailto:hello@viramahstay.com"
                                className="pp-cta-strip-btn"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                Contact Us
                            </a>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
