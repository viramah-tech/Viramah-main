"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ScheduleVisitModal } from "@/components/ui/ScheduleVisitModal";
import { EnquireNowButton } from "../ui/EnquireNowButton";

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
                            Admissions // 2026.AUG
                        </span>

                        <h2
                            className="cta-headline"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                                transition: "opacity 1s cubic-bezier(0.23,1,0.32,1) 0.2s, transform 1s cubic-bezier(0.23,1,0.32,1) 0.2s",
                                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                                lineHeight: "1.1",
                                marginBottom: "1.5rem",
                                letterSpacing: "0.01em"
                            }}
                        >
                            Everyone deserves <br />to live <span style={{ fontStyle: "italic", color: "#D8B56A" }}>better</span>.
                        </h2>

                        <p className="cta-description" style={reveal("0.3s")}>

                        </p>

                        <div className="cta-btn-group" style={reveal("0.4s")}>
                            <EnquireNowButton label="schedule a visit" />
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
