"use client";

import { Container } from "@/components/layout/Container";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/testimonials-section.css";

const TESTIMONIALS = [
    {
        quote: "I didn't just find a place — I found friends, focus, and a purpose here. The environment truly changed my daily productivity.",
        author: "Sneha Kapoor",
        role: "Student Resident, DU"
    },
    {
        quote: "Viramah is the first place that actually feels like home. The attention to detail in the spaces and the kindness of the staff is unmatched.",
        author: "Arjun Mehta",
        role: "Medical Resident"
    },
    {
        quote: "The community events are the highlight of my week. Meeting like-minded, ambitious students is exactly what I needed.",
        author: "Priya Sharma",
        role: "Creative Arts Student"
    }
];

export function TestimonialsSection() {
    return (
        <section className="tm-section">
            <div className="tm-grain" aria-hidden="true" />
            <Container>
                <div className="tm-header">
                    <span className="tm-eyebrow">Real Stories</span>
                    <h2 className="tm-title">Why Residents Love Us</h2>
                </div>

                <div className="tm-grid">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="tm-card">
                            <div className="tm-quote-mark">“</div>
                            <p className="tm-text">{t.quote}</p>
                            <div className="tm-author-info">
                                <span className="tm-name">{t.author}</span>
                                <span className="tm-role">{t.role}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="tm-ctas" style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "5rem" }}>
                    <EnquireNowButton variant="gold" label="Book a Space" />
                    <EnquireNowButton variant="outline" label="Schedule a Visit" />
                </div>
            </Container>
        </section>
    );
}
