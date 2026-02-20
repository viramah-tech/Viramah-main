"use client";

import { Container } from "@/components/layout/Container";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/what-is-viramah.css";

export function WhatIsViramah() {
    return (
        <section className="wv-intro-section">
            <Container>
                <div className="wv-intro-grid">
                    <div className="wv-intro-content">
                        <span className="wv-intro-eyebrow">The Art of the Pause</span>
                        <h2 className="wv-intro-title">
                            More than a PG.<br />
                            A foundation for <span className="wv-highlight">success</span>.
                        </h2>
                        <div className="wv-intro-body">
                            <p>
                                In a world of crowded hostels and ordinary PGs, Viramah was created as a pause —
                                a space where students can grow, focus, connect, and truly live.
                            </p>
                            <p>
                                Built by students who understand student struggles, we designed Viramah to solve
                                every real problem — from comfort and safety to productivity and community.
                            </p>
                            <p className="wv-intro-bold">
                                This is not just accommodation. This is your foundation for success.
                            </p>
                        </div>
                        <div className="wv-intro-ctas">
                            <EnquireNowButton variant="dark" label="Book a Space" />
                            <EnquireNowButton variant="outline" label="Schedule a Visit" />
                        </div>
                    </div>
                    <div className="wv-intro-visual">
                        <div className="wv-visual-card">
                            <div className="wv-visual-inner">
                                <span className="wv-visual-tag">Vrindavan</span>
                                <p className="wv-visual-text">
                                    "Located in the heart of Vrindavan, Viramah is a
                                    thoughtfully designed community space built for modern student life."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
