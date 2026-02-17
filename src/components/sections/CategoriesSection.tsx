"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// ── Data ──────────────────────────────────────────────────
interface CategoryItem {
    id: string;
    title: string;
    desc: string;
    count: string;
    href: string;
}

const CATEGORIES: CategoryItem[] = [
    {
        id: "001",
        title: "Community",
        desc: "Shared spaces designed for collaboration, conversations, and building lasting connections.",
        count: "4 Spaces",
        href: "/rooms",
    },
    {
        id: "002",
        title: "Quiet Zones",
        desc: "Focused environments for deep work, study sessions, and undisturbed concentration.",
        count: "3 Spaces",
        href: "/rooms",
    },
    {
        id: "003",
        title: "Fitness",
        desc: "State-of-the-art gym and wellness facilities to keep your body and mind in balance.",
        count: "2 Spaces",
        href: "/rooms",
    },
    {
        id: "004",
        title: "Dining",
        desc: "Curated culinary experiences from hearty meals to quick bites, fuelling your day.",
        count: "1 Space",
        href: "/rooms",
    },
    {
        id: "005",
        title: "Recreation",
        desc: "Gaming zones, swimming pool, and lounges for unwinding after a productive day.",
        count: "3 Spaces",
        href: "/rooms",
    },
    {
        id: "006",
        title: "Events",
        desc: "Gatherings, workshops, and cultural nights that bring the Viramah community together.",
        count: "Weekly",
        href: "/rooms",
    },
];

// Duplicate tiles for seamless marquee loop
const MARQUEE_TILES = [...CATEGORIES, ...CATEGORIES];

// ── Animation Variants ───────────────────────────────────
const headerVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] as const },
    },
};

// ── Arrow SVG ────────────────────────────────────────────
function ArrowIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
        >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
        </svg>
    );
}

// ── Component ────────────────────────────────────────────
export function CategoriesSection() {
    const [canHover, setCanHover] = useState(false);
    const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCanHover(
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
        );
    }, []);

    // ── Tap to Pause/Highlight (mobile only) ──
    const handleTileTap = useCallback(
        (index: number) => {
            if (canHover) return; // Desktop uses CSS :hover

            if (activeTileIndex === index) {
                // Tap same tile again — deactivate & resume
                setActiveTileIndex(null);
                marqueeRef.current?.classList.remove("cat-marquee-paused");
            } else {
                // Tap new tile — activate & pause
                setActiveTileIndex(index);
                marqueeRef.current?.classList.add("cat-marquee-paused");
            }
        },
        [canHover, activeTileIndex]
    );

    return (
        <section
            className="cat-section"
            id="categories"
        >
            <div className="cat-container">
                {/* ── Marquee ── */}
                <div className="cat-marquee-wrap">
                    {/* Edge fade masks */}
                    <div className="cat-marquee-mask-left" aria-hidden="true" />
                    <div className="cat-marquee-mask-right" aria-hidden="true" />

                    {/* Scrolling track */}
                    <div
                        className="cat-marquee"
                        ref={marqueeRef}
                        role="list"
                        aria-label="Browse living categories"
                    >
                        {MARQUEE_TILES.map((cat, i) => (
                            <Link
                                key={`${cat.id}-${i}`}
                                href={cat.href}
                                className={`cat-tile${activeTileIndex === i ? " cat-tile-active" : ""}`}
                                onClick={() => handleTileTap(i)}
                                aria-label={`${cat.title} — ${cat.count}`}
                                role="listitem"
                            >
                                {/* ID Badge */}
                                <span className="cat-tile-id">{cat.id}</span>

                                {/* Title */}
                                <div>
                                    <h3 className="cat-tile-title">
                                        {cat.title}
                                    </h3>
                                </div>

                                {/* Footer: desc + count + arrow */}
                                <div>
                                    <p className="cat-tile-desc">{cat.desc}</p>
                                    <div className="cat-tile-footer">
                                        <span className="cat-tile-count">
                                            {cat.count}
                                        </span>
                                        <div className="cat-tile-arrow">
                                            <ArrowIcon />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
