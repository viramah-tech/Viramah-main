"use client";

import Link from "next/link";
import Image from "next/image";
import "@/styles/founder-section.css";

export function FounderSection() {
    return (
        <section className="fs-section">
            {/* Background elements */}
            <div className="fs-grain" aria-hidden="true" />
            <div className="fs-ornament" aria-hidden="true" />

            <div className="fs-inner fs-layout">

                {/* Left — Quote content */}
                <div className="fs-content">
                    <div className="fs-quote-icon" aria-hidden="true">“</div>

                    <blockquote className="fs-quote-text">
                        &ldquo;We realized that the environment you sleep in dictates the quality of the work you wake up to do. Viramah is our answer to that — a space built for rest, so you can build your future.”
                    </blockquote>

                    <div className="fs-attribution">
                        <cite className="fs-founder-name">Founders of Viramah</cite>
                    </div>

                    <div className="fs-cta-wrap" style={{ display: "flex", gap: "2rem", alignItems: "center", marginTop: "2rem" }}>
                        <Link href="/about" className="fs-about-link">
                            Read Our Full Story
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Right — Image */}
                <div className="fs-image-wrap">
                    {/* Corner rivets */}
                    <div className="fs-rivet fs-rivet-tl" aria-hidden="true" />
                    <div className="fs-rivet fs-rivet-tr" aria-hidden="true" />
                    <div className="fs-rivet fs-rivet-bl" aria-hidden="true" />
                    <div className="fs-rivet fs-rivet-br" aria-hidden="true" />

                    <div className="fs-image-inner">
                        <Image
                            src="/diffrence section images/after (1).jpg"
                            alt="Viramah living space"
                            fill
                            className="fs-image"
                            style={{ objectFit: "cover", objectPosition: "center" }}
                        />
                        {/* Gold overlay shimmer */}
                        <div className="fs-image-overlay" aria-hidden="true" />
                    </div>

                    {/* Label tag */}
                    <div className="fs-image-tag">
                        <span className="fs-image-tag-dot" />
                        VIRAMAH INTERIORS
                    </div>
                </div>

            </div>
        </section>
    );
}
