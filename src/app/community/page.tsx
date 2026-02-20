"use client";

import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useEffect, useRef } from "react";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/community-page.css";

const PERKS = [
    {
        icon: "",
        title: "Weekly Community Dinners",
        desc: "Every Sunday, the whole house sits down together. Good food, real conversations, new friendships.",
    },
    {
        icon: "",
        title: "Peer Mentorship",
        desc: "Connect with seniors, alumni, and industry professionals who've walked your path.",
    },
    {
        icon: "",
        title: "Shared Workspaces",
        desc: "24/7 access to quiet study rooms, collaboration zones, and high-speed internet.",
    },
    {
        icon: "",
        title: "Cultural Nights",
        desc: "Music, art, film screenings, and open mics — because life is more than academics.",
    },
    {
        icon: "",
        title: "Fitness & Wellness",
        desc: "Gym, yoga sessions, and wellness workshops to keep your body and mind in balance.",
    },
    {
        icon: "",
        title: "Alumni Network",
        desc: "Once a Viramah resident, always part of the family. Our alumni network spans 20+ cities.",
    },
];

const TESTIMONIALS = [
    {
        name: "Arjun M.",
        course: "B.Tech, IIT Delhi",
        text: "I came to Viramah for the room. I stayed for the people. My two best friends and my co-founder are all from here.",
    },
    {
        name: "Priya S.",
        course: "MBA, IIM Ahmedabad",
        text: "The community dinners changed my life. I met my mentor at one of them. Viramah is not a PG — it's a launchpad.",
    },
    {
        name: "Rohan K.",
        course: "Design, NID",
        text: "As a creative, I needed an environment that inspired me. Viramah's spaces and the people in them do exactly that.",
    },
];

export default function CommunityPage() {
    const perksRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cards = perksRef.current?.querySelectorAll<HTMLElement>(".cm-perk-card");
        if (!cards) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting) {
                    (e.target as HTMLElement).style.opacity = "1";
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    observer.unobserve(e.target);
                }
            }),
            { threshold: 0.1 }
        );
        cards.forEach(c => observer.observe(c));
        return () => observer.disconnect();
    }, []);

    return (
        <main className="cm-page">
            <Navigation />

            {/* ── Hero ── */}
            <section className="cm-hero">
                <div className="cm-hero-grain" aria-hidden="true" />
                <div className="cm-hero-bg-text" aria-hidden="true">PEOPLE</div>
                <div className="cm-hero-inner">
                    <p className="cm-eyebrow">The Viramah Community</p>
                    <h1 className="cm-hero-title">
                        Members,<br />
                        <span className="cm-gold">not tenants.</span>
                    </h1>
                    <p className="cm-hero-sub">
                        Viramah isn't just a place to sleep. It's a network of ambitious minds,
                        creative souls, and future leaders — all under one roof.
                    </p>
                    <div className="cm-hero-tags">
                        {["Ambitious", "Creative", "Curious", "Driven", "Diverse", "Kind"].map(tag => (
                            <span key={tag} className="cm-tag">{tag}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Philosophy ── */}
            <section className="cm-philosophy">
                <div className="cm-philosophy-inner">
                    <div className="cm-philosophy-text">
                        <p className="cm-eyebrow cm-eyebrow-dark">Our Philosophy</p>
                        <h2 className="cm-section-title">We curate,<br />not just accommodate.</h2>
                        <p className="cm-body">
                            Every resident at Viramah goes through a simple but intentional process.
                            We're not looking for perfect people — we're looking for people who are genuinely curious,
                            kind, and excited to grow.
                        </p>
                        <p className="cm-body">
                            When you live at Viramah, you live with people who inspire you.
                            That's not an accident — it's by design.
                        </p>
                        <EnquireNowButton variant="dark" label="Enquire Now" />
                    </div>
                    <div className="cm-philosophy-visual">
                        <div className="cm-visual-card">
                            <div className="cm-visual-stat">
                                <span className="cm-big-num">500+</span>
                                <span className="cm-big-label">Active Residents</span>
                            </div>
                            <div className="cm-visual-divider" />
                            <div className="cm-visual-stat">
                                <span className="cm-big-num">20+</span>
                                <span className="cm-big-label">Colleges Represented</span>
                            </div>
                            <div className="cm-visual-divider" />
                            <div className="cm-visual-stat">
                                <span className="cm-big-num">12+</span>
                                <span className="cm-big-label">Events per Month</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Perks ── */}
            <section className="cm-perks-section">
                <div className="cm-perks-inner">
                    <p className="cm-eyebrow">What you get</p>
                    <h2 className="cm-section-title cm-light">Community Perks</h2>
                    <div className="cm-perks-grid" ref={perksRef}>
                        {PERKS.map((perk, i) => (
                            <div
                                key={perk.title}
                                className="cm-perk-card"
                                style={{
                                    opacity: 0,
                                    transform: "translateY(30px)",
                                    transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 0.1}s`
                                }}
                            >
                                <span className="cm-perk-icon">{perk.icon}</span>
                                <h3 className="cm-perk-title">{perk.title}</h3>
                                <p className="cm-perk-desc">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="cm-testimonials">
                <div className="cm-testimonials-inner">
                    <p className="cm-eyebrow cm-eyebrow-dark">Voices from the community</p>
                    <h2 className="cm-section-title">What residents say.</h2>
                    <div className="cm-testimonials-grid">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className="cm-testimonial-card">
                                <p className="cm-testimonial-text">"{t.text}"</p>
                                <div className="cm-testimonial-author">
                                    <div className="cm-author-avatar">{t.name[0]}</div>
                                    <div>
                                        <p className="cm-author-name">{t.name}</p>
                                        <p className="cm-author-course">{t.course}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cm-cta-section">
                <div className="cm-cta-grain" aria-hidden="true" />
                <div className="cm-cta-inner">
                    <h2 className="cm-cta-title">Your people are waiting.</h2>
                    <p className="cm-cta-sub">Join a community that will shape who you become.</p>
                    <EnquireNowButton variant="gold" label="Enquire Now" />
                </div>
            </section>

            <Footer />
        </main>
    );
}
