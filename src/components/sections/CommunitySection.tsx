"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/community-section.css";

const PERKS = [
    { icon: "🍽️", label: "Weekly Dinners" },
    { icon: "🧠", label: "Peer Mentorship" },
    { icon: "💻", label: "Shared Workspaces" },
    { icon: "🎭", label: "Cultural Nights" },
    { icon: "🏋️", label: "Fitness & Wellness" },
    { icon: "🌐", label: "Alumni Network" },
];

const STATS = [
    { num: "500+", label: "Active Residents" },
    { num: "20+", label: "Colleges" },
    { num: "12+", label: "Events / Month" },
];

export function CommunitySection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const items = sectionRef.current?.querySelectorAll<HTMLElement>(".cs-perk-pill, .cs-stat");
        if (!items) return;
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
        items.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <section className="cs-section" ref={sectionRef}>
            {/* Grain overlay */}
            <div className="cs-grain" aria-hidden="true" />

            <div className="cs-inner">
                {/* ── Left: Image + Stats ── */}
                <div className="cs-left">
                    <div className="cs-image-wrap">
                        <Image
                            src="/communities.jpg"
                            alt="Viramah Community — people connecting"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            quality={95}
                            loading="lazy"
                            className="cs-image"
                        />
                        {/* Overlay tint */}
                        <div className="cs-image-overlay" aria-hidden="true" />

                        {/* Floating stats card */}
                        <div className="cs-stats-card">
                            {STATS.map((s, i) => (
                                <div
                                    key={s.label}
                                    className="cs-stat"
                                    style={{
                                        opacity: 0,
                                        transform: "translateY(16px)",
                                        transition: `opacity 0.5s ease ${0.3 + i * 0.1}s, transform 0.5s ease ${0.3 + i * 0.1}s`,
                                    }}
                                >
                                    <span className="cs-stat-num">{s.num}</span>
                                    <span className="cs-stat-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Content ── */}
                <div className="cs-right">
                    <p className="cs-eyebrow">The Viramah Community</p>
                    <h2 className="cs-title">
                        Members,<br />
                        <span className="cs-title-gold">not tenants.</span>
                    </h2>
                    <p className="cs-body">
                        Viramah is home to artists, founders, and scholars.
                        Our spaces are curated to foster connection without forcing it —
                        a network of ambitious minds all under one roof.
                    </p>

                    {/* Perks pills */}
                    <div className="cs-perks">
                        {PERKS.map((p, i) => (
                            <div
                                key={p.label}
                                className="cs-perk-pill"
                                style={{
                                    opacity: 0,
                                    transform: "translateY(12px)",
                                    transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`,
                                }}
                            >
                                <span className="cs-perk-icon">{p.icon}</span>
                                <span className="cs-perk-label">{p.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="cs-ctas">
                        <EnquireNowButton variant="gold" label="Enquire Now" />
                        <Link href="/community" className="cs-link-btn">
                            Meet the Community
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
