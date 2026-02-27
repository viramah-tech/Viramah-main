"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/faq-section.css";

const FAQS = [
    {
        q: "What is included in the rent?",
        a: "Our all-inclusive rent covers your premium furnished stay, high-speed WiFi, daily housekeeping, 24/7 security, In-House Mess with 3 meals a day (Breakfast, Supper & Dinner), and full access to all community spaces like the gaming zone, gym, and library. We believe in zero hidden surprises."
    },
    {
        q: "Is food available?",
        a: "Yes! We take food seriously. At Viramah, we serve 3 wholesome meals a day — Breakfast, Supper, and Dinner — through our In-House Quality Mess. Beyond that, we also have a 24x7 Canteen, Self Pantry Services, and a Restaurant on-site. And the best part? The mess menu is selected by you, for you."
    },
    {
        q: "What security measures are in place?",
        a: "Your safety is our priority. We have 2-layer round-the-clock security with continuous 24x7 CCTV surveillance monitoring of all common areas and residential zones, so you can live stress-free."
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
