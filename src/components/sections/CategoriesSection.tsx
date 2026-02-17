"use client";

import { useCallback, useEffect, useState } from "react";
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

// ── Animation Variants ───────────────────────────────────
const tileVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.25, 1, 0.5, 1] as const,
            delay: i * 0.1,
        },
    }),
};

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

    useEffect(() => {
        setCanHover(
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
        );
    }, []);

    // ── Mouse-parallax shadow effect (desktop only) ──
    const handleGlobalPointerMove = useCallback(
        (e: React.PointerEvent<HTMLElement>) => {
            if (!canHover) return;

            const moveX = (e.clientX - window.innerWidth / 2) * 0.008;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.008;

            const tiles = e.currentTarget.querySelectorAll<HTMLElement>(
                ".cat-tile:not(:hover)"
            );
            tiles.forEach((t) => {
                t.style.boxShadow = `
                    ${12 + moveX}px ${12 + moveY}px 24px var(--cat-shadow-dark),
                    ${-12 + moveX}px ${-12 + moveY}px 24px var(--cat-shadow-light)
                `;
            });
        },
        [canHover]
    );

    const handleGlobalPointerLeave = useCallback(() => {
        // Reset all tiles to default shadow
        document
            .querySelectorAll<HTMLElement>(".cat-tile")
            .forEach((t) => {
                t.style.boxShadow = "";
            });
    }, []);

    return (
        <section
            className="cat-section"
            id="categories"
            onPointerMove={handleGlobalPointerMove}
            onPointerLeave={handleGlobalPointerLeave}
        >
            <div className="cat-container">
                {/* ── Tile Grid ── */}
                <div className="cat-grid" role="list">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={tileVariants}
                            role="listitem"
                        >
                            <Link
                                href={cat.href}
                                className="cat-tile"
                                aria-label={`${cat.title} — ${cat.count}`}
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
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
