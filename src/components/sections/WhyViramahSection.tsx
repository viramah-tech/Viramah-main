"use client";

import "@/styles/why-viramah.css";
import { useEffect, useRef } from "react";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";

// ── USP Data ─────────────────────────────────────────────
const USPS = [
    {
        num: "01",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
        title: "Premium Furnished Spaces",
        desc: "Thoughtfully designed interiors that feel modern, clean, and peaceful — spaces that feel like home, but better.",
    },
    {
        num: "02",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
            </svg>
        ),
        title: "High-Speed WiFi",
        desc: "Because productivity should never buffer. Binge, build, or brainstorm with seamless high-speed internet.",
    },
    {
        num: "03",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Safe & Secure Living",
        desc: "Round-the-clock security, CCTV monitoring, and smart access — so you can focus on you, stress-free.",
    },
    {
        num: "04",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: "Community Vibes",
        desc: "Connect with driven students, creators, and professionals. Collaborate, chill, and grow — all under one roof.",
    },
    {
        num: "05",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
            </svg>
        ),
        title: "Housekeeping & Maintenance",
        desc: "You live your best life — we handle the rest. Fresh living, clean spaces, zero worries. Daily housekeeping included.",
    },
    {
        num: "06",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
            </svg>
        ),
        title: "Events & Experiences",
        desc: "From weekend movie nights to skill-building sessions and mini fests — every week is a new opportunity to vibe.",
    },
];

// ── Component ─────────────────────────────────────────────
export function WhyViramahSection() {
    const sectionRef = useRef<HTMLElement>(null);

    // Scroll-reveal animation via IntersectionObserver
    useEffect(() => {
        const cards = sectionRef.current?.querySelectorAll<HTMLElement>(".wv-card");
        if (!cards) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).style.opacity = "1";
                        (entry.target as HTMLElement).style.transform = "translateY(0)";
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        cards.forEach((card) => observer.observe(card));
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="wv-section" id="why-viramah">
            {/* ── Background grain ── */}
            <div className="wv-grain" aria-hidden="true" />

            {/* ── Decorative large text ── */}
            <div className="wv-bg-text" aria-hidden="true">WHY</div>

            <div className="wv-inner">
                {/* ── Header ── */}
                <div className="wv-header">

                    <h2 className="wv-title">
                        Why Choose<br />
                        <span className="wv-title-gold">Viramah?</span>
                    </h2>
                    <p className="wv-subtitle">
                        Designed for students, by students. Built for focus, comfort, and community.
                    </p>
                </div>

                {/* ── USP Grid ── */}
                <div className="wv-grid">
                    {USPS.map((usp, i) => (
                        <div
                            key={usp.num}
                            className="wv-card"
                            style={{
                                opacity: 0,
                                transform: "translateY(40px)",
                                transition: `opacity 0.7s ease ${i * 0.1}s, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.1}s`,
                            }}
                        >
                            {/* Number */}
                            <span className="wv-card-num">{usp.num}</span>

                            {/* Icon */}
                            <div className="wv-card-icon">{usp.icon}</div>

                            {/* Content */}
                            <h3 className="wv-card-title">{usp.title}</h3>
                            <p className="wv-card-desc">{usp.desc}</p>

                            {/* Bottom accent line */}
                            <div className="wv-card-line" />
                        </div>
                    ))}
                </div>

                {/* ── Bottom CTA strip ── */}
                <div className="wv-cta" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                    {/* <EnquireNowButton variant="gold" label="Book a Room" />
                    <EnquireNowButton variant="outline" label="Schedule a Visit" /> */}
                </div>
            </div>

            {/* ── Section Divider ── 
            <div className="wv-divider" aria-hidden="true">
                <svg
                    viewBox="0 0 1200 56"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="wv-divider-svg"
                >
                    Full-width hairline  
                    <line x1="0" y1="28" x2="1200" y2="28" stroke="rgba(216,181,106,0.3)" strokeWidth="1.5" />

                     Left zigzag segment 
                    <polyline
                        points="0,28 80,10 160,28 240,10 320,28 400,10 460,28"
                        fill="none"
                        stroke="rgba(216,181,106,0.55)"
                        strokeWidth="2"
                        strokeLinejoin="miter"
                    />

                     Central diamond ornament 
                    <polygon
                        points="600,10 618,28 600,46 582,28"
                        fill="none"
                        stroke="#D8B56A"
                        strokeWidth="2.5"
                    />
                    <circle cx="600" cy="28" r="4" fill="#D8B56A" />

                     Right zigzag segment 
                    <polyline
                        points="740,28 800,10 880,28 960,10 1040,28 1120,10 1200,28"
                        fill="none"
                        stroke="rgba(216,181,106,0.55)"
                        strokeWidth="2"
                        strokeLinejoin="miter"
                    />


                </svg>
            </div> */}
        </section>
    );
}
