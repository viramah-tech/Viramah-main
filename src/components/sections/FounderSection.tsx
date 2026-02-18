"use client";

import Link from "next/link";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/founder-section.css";

export function FounderSection() {
    return (
        <section className="fs-section">
            {/* Background elements */}
            <div className="fs-grain" aria-hidden="true" />
            <div className="fs-ornament" aria-hidden="true" />

            <div className="fs-inner">
                {/* Visual anchor */}
                <div className="fs-quote-icon" aria-hidden="true">“</div>

                {/* The Vision */}
                <blockquote className="fs-quote-text">
                    "We realized that the environment you sleep in dictates the quality of the work you wake up to do. Viramah is our answer to that — a space built for rest, so you can build your future."
                </blockquote>

                {/* Attribution */}
                <div className="fs-attribution">
                    <cite className="fs-founder-name">Akshat & Co-Founders</cite>
                    <span className="fs-founder-title">Founders of Viramah</span>
                </div>

                {/* Link to story */}
                <div className="fs-cta-wrap" style={{ display: "flex", gap: "2rem", alignItems: "center", marginTop: "2rem" }}>
                    <EnquireNowButton variant="gold" label="Book a Room" />
                    <Link href="/about" className="fs-about-link">
                        Read Our Full Story
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
