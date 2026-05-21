"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import { ScheduleVisitButton } from "@/components/ui/ScheduleVisitButton";
import "@/styles/community-section.css";

const PERKS = [
    { icon: "", label: "Peer Mentorship" },
    { icon: "", label: "Shared Workspaces" },
    { icon: "", label: "Cultural Nights" },
    { icon: "", label: "Fitness & Wellness" },
    { icon: "", label: "Alumni Network" },
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
                {/* ── Content ── */}
                <div className="cs-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                    <div className="cs-perks" style={{ justifyContent: 'center' }}>
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
                    <div className="cs-ctas" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <EnquireNowButton variant="gold" label="Enquire Now" />
                        <ScheduleVisitButton variant="dark" />
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
