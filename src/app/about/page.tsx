"use client";

import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useEffect, useRef } from "react";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import "@/styles/about-page.css";

const VALUES = [
    { num: "01", title: "Privacy First", desc: "Your space is yours. We design for solitude as much as for togetherness." },
    { num: "02", title: "Design Led", desc: "Every corner is intentional — materials, light, and layout chosen with care." },
    { num: "03", title: "Community Driven", desc: "We curate a network of ambitious, curious, and kind people." },
    { num: "04", title: "Radically Transparent", desc: "One price. No hidden fees. No surprises. Ever." },
    { num: "05", title: "Safe & Secure", desc: "24/7 security, verified residents, and a team that genuinely cares." },
    { num: "06", title: "Built to Last", desc: "Sustainable materials, thoughtful maintenance, and spaces that age well." },
];

const FEATURES = [
    {
        icon: "",
        title: "Premium Furnished Spaces",
        tagline: "Spaces that feel like home — but better.",
        desc: "Stylish, thoughtfully designed spaces where modern comfort meets calm energy. From plush furniture to cozy lighting, every detail is crafted to help you live, study, and sleep better.",
    },
    {
        icon: "",
        title: "High-Speed WiFi",
        tagline: "Because your life shouldn't lag.",
        desc: "Binge, build, or brainstorm — stay connected with seamless high-speed internet that keeps up with your lifestyle.",
    },
    {
        icon: "",
        title: "Safe & Secure Living",
        tagline: "Your safety is our priority. Always.",
        desc: "Round-the-clock security, CCTV monitoring, and smart access — so you can focus on you, stress-free.",
    },
    {
        icon: "",
        title: "Community Vibes",
        tagline: "Meet people who get you.",
        desc: "Connect with driven students, creators, and professionals. Collaborate, chill, and grow — all under one roof.",
    },
    {
        icon: "",
        title: "Housekeeping & Maintenance",
        tagline: "You live your best life — we handle the rest.",
        desc: "Fresh living areas, clean spaces, zero worries. Daily housekeeping and quick maintenance keep your space spotless and hassle-free.",
    },
    {
        icon: "",
        title: "Events & Experiences",
        tagline: "More than just a stay — it's a lifestyle.",
        desc: "From weekend movie nights to skill-building sessions and mini fests — every week is a new opportunity to vibe, learn, and belong.",
    },
];

const TIMELINE = [
    { year: "2022", event: "The idea is born — two students frustrated with the state of PG housing." },
    { year: "2023", event: "First property acquired. 12 spaces. 12 residents. One shared vision." },
    { year: "2024", event: "Viramah officially launches. 500+ residents across 3 properties." },
    { year: "2025", event: "Expanding to 5 cities. Building the largest student living community in India." },
];

export default function AboutPage() {
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cards = cardsRef.current?.querySelectorAll<HTMLElement>(".ab-value-card");
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
        <main className="ab-page">
            <Navigation />

            {/* ── Hero ── */}
            <section className="ab-hero">
                <div className="ab-hero-grain" aria-hidden="true" />
                <div className="ab-hero-bg-text" aria-hidden="true">ABOUT</div>
                <div className="ab-hero-inner">
                    <p className="ab-eyebrow">Est. 2022 · Viramah</p>
                    <h1 className="ab-hero-title">
                        We didn't find it,<br />
                        <span className="ab-gold">so we built it.</span>
                    </h1>
                    <p className="ab-hero-sub">
                        Viramah was born from a simple frustration — student housing that treats you like a number.
                        We're building something different. Spaces that honour the student journey.
                    </p>
                    <div className="ab-hero-stats">
                        {[["500+", "Residents"], ["3", "Properties"], ["6", "Cities by 2025"], ["4.9", "Avg. Rating"]].map(([num, label]) => (
                            <div key={label} className="ab-stat">
                                <span className="ab-stat-num">{num}</span>
                                <span className="ab-stat-label">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission ── */}
            <section className="ab-mission">
                <div className="ab-mission-inner">
                    <div className="ab-mission-left">
                        <p className="ab-eyebrow ab-eyebrow-dark">Our Mission</p>
                        <h2 className="ab-section-title">
                            A sanctuary for the<br />student mind.
                        </h2>
                        <p className="ab-body-text">
                            Your environment shapes your future. We believe that where you live during your formative years matters more than most people realise.
                        </p>
                        <p className="ab-body-text">
                            Viramah is built to balance privacy with community — giving you the space to rest, reflect, and grow into the person you're becoming.
                        </p>
                        <EnquireNowButton variant="dark" label="Enquire Now" />
                    </div>
                    <div className="ab-mission-right">
                        <div className="ab-mission-card">
                            <blockquote className="ab-quote">
                                "We build spaces that rest the chaos of the city, giving you the room to build yourself."
                            </blockquote>
                            <cite className="ab-quote-cite">— The Viramah Founders</cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Timeline ── */}
            <section className="ab-timeline-section">
                <div className="ab-timeline-inner">
                    <p className="ab-eyebrow">Our Journey</p>
                    <h2 className="ab-section-title ab-light">From idea to movement.</h2>
                    <div className="ab-timeline">
                        {TIMELINE.map((item, i) => (
                            <div key={item.year} className="ab-timeline-item" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="ab-timeline-year">{item.year}</div>
                                <div className="ab-timeline-dot" />
                                <div className="ab-timeline-text">{item.event}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="ab-values-section">
                <div className="ab-values-inner">
                    <p className="ab-eyebrow ab-eyebrow-dark">What we stand for</p>
                    <h2 className="ab-section-title">Our Values</h2>
                    <div className="ab-values-grid" ref={cardsRef}>
                        {VALUES.map((v, i) => (
                            <div
                                key={v.num}
                                className="ab-value-card"
                                style={{
                                    opacity: 0,
                                    transform: "translateY(30px)",
                                    transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 0.08}s`
                                }}
                            >
                                <span className="ab-value-num">{v.num}</span>
                                <h3 className="ab-value-title">{v.title}</h3>
                                <p className="ab-value-desc">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <TestimonialsSection />

            {/* ── What We Offer ── */}
            <section className="ab-features-section">
                <div className="ab-features-inner">
                    <p className="ab-eyebrow ab-eyebrow-dark">Everything included</p>
                    <h2 className="ab-section-title">What we offer.</h2>
                    <div className="ab-features-grid">
                        {FEATURES.map((f, i) => (
                            <div key={f.title} className="ab-feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                                <span className="ab-feature-icon">{f.icon}</span>
                                <div className="ab-feature-content">
                                    <h3 className="ab-feature-title">{f.title}</h3>
                                    <p className="ab-feature-tagline">{f.tagline}</p>
                                    <p className="ab-feature-desc">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Closing brand line */}
                    <div className="ab-features-closer">
                        <span className="ab-features-closer-star"></span>
                        <p className="ab-features-closer-title">Viramah Stay — Where Comfort Meets Community.</p>
                        <p className="ab-features-closer-sub">Live. Learn. Connect. Repeat.</p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="ab-cta-section">
                <div className="ab-cta-grain" aria-hidden="true" />
                <div className="ab-cta-inner">
                    <p className="ab-eyebrow">Ready?</p>
                    <h2 className="ab-cta-title">Join the movement.</h2>
                    <p className="ab-cta-sub">500+ students already call Viramah home. Your chapter starts here.</p>
                    <div className="ab-cta-btns">
                        <EnquireNowButton variant="gold" label="Enquire Now" />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
