"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// ── Data ──────────────────────────────────────────────────
interface ComparisonItem {
    beforeSrc: string;
    afterSrc: string;
    beforeAlt: string;
    afterAlt: string;
    title: string;
    index: string;
}

const COMPARISONS: ComparisonItem[] = [
    {
        beforeSrc: "/diffrence section images/before(1).jpg",
        afterSrc: "/diffrence section images/after (1).jpg",
        beforeAlt: "Before Viramah — original space",
        afterAlt: "After Viramah — modern living transformation",
        title: "Living Space",
        index: "// 001",
    },
    {
        beforeSrc: "/diffrence section images/before(2).jpg",
        afterSrc: "/diffrence section images/after (2).jpg",
        beforeAlt: "Before Viramah — original area",
        afterAlt: "After Viramah — enhanced community area",
        title: "Living Space",
        index: "// 002",
    },
];

// ── Animation Variants ───────────────────────────────────
const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.9,
            ease: [0.23, 1, 0.32, 1] as const,
            delay: i * 0.2,
        },
    }),
};

const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.23, 1, 0.32, 1] as const,
        },
    },
};

// ── Component ────────────────────────────────────────────
export function DifferenceSection() {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    // ── Pointer handler (mouse + touch unified) ──
    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>, index: number) => {
            if (document.body.style.overflow === "hidden") return;
            const card = cardRefs.current[index];
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = ((rect.width - x) / rect.width) * 100;
            const constrained = Math.min(Math.max(percentage, 0), 100);

            const before = card.querySelector(
                ".diff-image-before"
            ) as HTMLElement;
            const fissure = card.querySelector(".diff-fissure") as HTMLElement;

            if (before)
                before.style.clipPath = `inset(0 ${constrained}% 0 0)`;
            if (fissure) fissure.style.left = `${100 - constrained}%`;
        },
        []
    );

    // ── Reset on leave ──
    const handlePointerLeave = useCallback((index: number) => {
        const card = cardRefs.current[index];
        if (!card) return;

        const before = card.querySelector(".diff-image-before") as HTMLElement;
        const fissure = card.querySelector(".diff-fissure") as HTMLElement;

        if (before) {
            before.style.transition =
                "clip-path 0.8s cubic-bezier(0.23, 1, 0.32, 1)";
            before.style.clipPath = "inset(0 50% 0 0)";
        }
        if (fissure) {
            fissure.style.transition =
                "left 0.8s cubic-bezier(0.23, 1, 0.32, 1)";
            fissure.style.left = "50%";
        }

        setTimeout(() => {
            if (before) before.style.transition = "none";
            if (fissure) fissure.style.transition = "none";
        }, 850);
    }, []);

    // ── Keyboard accessibility ──
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, index: number) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();

            const card = cardRefs.current[index];
            if (!card) return;

            const before = card.querySelector(
                ".diff-image-before"
            ) as HTMLElement;
            const fissure = card.querySelector(".diff-fissure") as HTMLElement;
            if (!before) return;

            // Parse current clip-path value
            const match = before.style.clipPath.match(
                /inset\(0(?:px)?\s+([\d.]+)%/
            );
            const current = match ? parseFloat(match[1]) : 50;

            let next = current;
            if (e.key === "ArrowLeft") next = Math.min(100, current + 5);
            if (e.key === "ArrowRight") next = Math.max(0, current - 5);

            before.style.clipPath = `inset(0 ${next}% 0 0)`;
            if (fissure) fissure.style.left = `${100 - next}%`;
        },
        []
    );

    return (
        <section className="diff-section" id="difference">
            <div className="diff-container">
                {/* ── Header ── */}
                <motion.header
                    className="diff-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={headerVariants}
                >
                    <h2 className="diff-header-quote">
                        BUILDING COMMUNITY <br /> NOT ROOMS
                    </h2>

                </motion.header>



                {/* ── Comparison Grid ── */}
                <div className="diff-grid">
                    {COMPARISONS.map((item, i) => (
                        <motion.div
                            key={item.index}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={cardVariants}
                        >
                            {/* Monolith Card */}
                            <div
                                className="diff-monolith"
                                ref={(el) => {
                                    cardRefs.current[i] = el;
                                }}
                                onPointerMove={(e) =>
                                    handlePointerMove(e, i)
                                }
                                onPointerLeave={() => handlePointerLeave(i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                role="slider"
                                aria-label={`Before and after comparison: ${item.title}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={50}
                                tabIndex={0}
                            >
                                {/* Labels */}
                                <div className="diff-labels">
                                    <span className="diff-label-tag">
                                        TRADITIONAL HOSTEL
                                    </span>
                                    <span className="diff-label-tag">
                                        VIRAMAH
                                    </span>
                                </div>

                                {/* Image Container */}
                                <div className="diff-image-container">
                                    {/* After image (background) */}
                                    <Image
                                        src={item.afterSrc}
                                        alt={item.afterAlt}
                                        fill
                                        sizes="(max-width: 767px) 90vw, (max-width: 1024px) 45vw, 650px"
                                        quality={85}
                                        className="diff-image-after"
                                        loading="lazy"
                                    />

                                    {/* Before image (clipped overlay) */}
                                    <div className="diff-image-before">
                                        <Image
                                            src={item.beforeSrc}
                                            alt={item.beforeAlt}
                                            fill
                                            sizes="(max-width: 767px) 90vw, (max-width: 1024px) 45vw, 650px"
                                            quality={85}
                                            className="diff-image-before-img"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Fissure / Comparison Line */}
                                    <div className="diff-fissure" />
                                </div>
                            </div>

                            {/* Card Info */}
                            <div className="diff-info">
                                <div className="diff-card-title">
                                    {item.title}
                                </div>
                                <div className="diff-card-index">
                                    {item.index}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
