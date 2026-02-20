"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/faq-section.css";

const FAQS = [
    {
        q: "What is included in the rent?",
        a: "Our all-inclusive rent covers your premium furnished stay, high-speed WiFi, daily housekeeping, 24/7 security, and full access to all community spaces like the gaming zone, gym, and library. We believe in zero hidden surprises."
    },
    {
        q: "Is food available?",
        a: "Yes! We take food seriously. At Viramah, you get healthy, home-style meals with a local touch. No boring hostel food here — only fresh, nutritious, and delicious flavors that make you feel at home."
    },
    {
        q: "Are there separate areas for boys and girls?",
        a: "Yes, we have strictly separate floors/wings and dedicated security protocols for both male and female residents to ensure maximum comfort, privacy, and safety for everyone."
    },
    {
        q: "What security measures are in place?",
        a: "Your safety is our priority. We have round-the-clock security personnel, continuous CCTV monitoring of common areas, and bio-metric/smart-card access control to all residential zones."
    },
    {
        q: "What is the booking process?",
        a: "Booking is simple: Select your preferred living type, schedule a visit or take a virtual tour, submit your basic documents, and pay the security deposit to lock your space. Our team will guide you every step of the way."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="faq-section">
            <Container>
                <div className="faq-grid">
                    <div className="faq-header">
                        <span className="faq-eyebrow">Clear Answers</span>
                        <h2 className="faq-title">Frequently Asked Questions</h2>
                        <p className="faq-subtitle">Everything you need to know about living the Viramah life.</p>
                        <div className="faq-header-ctas" style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
                            <EnquireNowButton variant="gold" label="Book a Space" />
                            <EnquireNowButton variant="outline" label="Schedule a Visit" />
                        </div>
                    </div>

                    <div className="faq-list">
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                className={`faq-item ${openIndex === i ? 'faq-item-open' : ''}`}
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <div className="faq-question">
                                    <span>{faq.q}</span>
                                    <div className="faq-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="faq-answer">
                                    <div className="faq-answer-inner">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
