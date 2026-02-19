"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ScheduleVisitModal } from "@/components/ui/ScheduleVisitModal";

export function ClosingSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Scroll reveal — fires once when section enters viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0, rootMargin: "0px 0px -60px 0px" }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const reveal = (delay: string): React.CSSProperties => ({
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 1s cubic-bezier(0.23,1,0.32,1) ${delay}, transform 1s cubic-bezier(0.23,1,0.32,1) ${delay}`,
    });

    return (
        <>
            <section ref={sectionRef} className="cta-section-wrapper">
                <div className="cta-pulp-card">


                    {/* Left — Primary content */}
                    <div className="cta-content">
                        <span className="cta-mono-label" style={reveal("0.1s")}>
                            Admissions // 2025.AUG
                        </span>

                        <h2
                            className="cta-headline"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                                transition: "opacity 1s cubic-bezier(0.23,1,0.32,1) 0.2s, transform 1s cubic-bezier(0.23,1,0.32,1) 0.2s",
                                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                                lineHeight: "1.1",
                                marginBottom: "1.5rem"
                            }}
                        >
                            Everyone deserves <br />to live <span style={{ fontStyle: "italic", color: "#D8B56A" }}>better</span>.
                        </h2>

                        <p className="cta-description" style={reveal("0.3s")}>
                            We didn't find the perfect space for us, so we created it for you.
                            Join the community building the future of student life. Admissions for 2025 are now open.
                        </p>

                        <div className="cta-btn-group" style={reveal("0.4s")}>
                            <Link href="/signup" className="cta-stamped-btn">
                                APPLY NOW
                            </Link>
                            <button
                                className="cta-ghost-btn"
                                onClick={() => setIsModalOpen(true)}
                            >
                                SCHEDULE A VISIT
                            </button>
                        </div>

                        <div
                            className="cta-availability"
                            style={{
                                opacity: isVisible ? 0.6 : 0,
                                transition: "opacity 1s cubic-bezier(0.23,1,0.32,1) 0.55s",
                            }}
                        >
                            <span className="cta-availability-dot" aria-hidden="true" />
                            Accepting applications
                        </div>
                    </div>

                    {/* Right — Meta block */}
                    <div
                        className="cta-meta"
                        style={{
                            textAlign: "right",
                            ...reveal("0.5s"),
                        }}
                    >
                        <div className="cta-dots" aria-hidden="true">
                            <div className="cta-dot" />
                            <div className="cta-dot" />
                            <div className="cta-dot" />
                        </div>
                        <span className="cta-mono-label" style={{ marginBottom: 0 }}>
                            Viramah // Est. 2024
                        </span>
                    </div>
                </div>
            </section>

            <ScheduleVisitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
