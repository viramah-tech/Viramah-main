"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// ── Data ──────────────────────────────────────────────────
interface GalleryItem {
    src: string;
    alt: string;
    label: string;
    title: string;
    stats: string[];
    span: 4 | 8 | 12;
}

const GALLERY_ITEMS: GalleryItem[] = [
    {
        src: "/life at viramah images/common area.jpg",
        alt: "Common area — the social hub for meetups and workshops",
        label: "COMMUNITY_RITUALS",
        title: "Weekly Meetups",
        stats: ["SUNDAY DINNERS", "GAME NIGHTS", "STUDY GROUPS"],
        span: 8,
    },
    {
        src: "/life at viramah images/swiming pool.jpg",
        alt: "Swimming pool and wellness deck",
        label: "WELLNESS_CORE",
        title: "Fitness & Zen",
        stats: ["YOGA SESSIONS", "POOL RECOVERY"],
        span: 4,
    },
    {
        src: "/life at viramah images/gaming zone.jpg",
        alt: "Gaming and skills lab",
        label: "CREATIVE_LAB",
        title: "Workshops & Play",
        stats: ["SKILL SESSIONS", "TOURNAMENTS", "LIVE"],
        span: 12,
    },
];

// ── Animation Variants ───────────────────────────────────
const cardVariants = {
    hidden: { opacity: 0, y: 80, rotateX: 8 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
            duration: 1,
            ease: [0.23, 1, 0.32, 1] as const,
            delay: i * 0.15,
        },
    }),
};

const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] as const },
    },
};

// ── Component ────────────────────────────────────────────
export function LifeAtViramahSection() {
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const [canHover, setCanHover] = useState(false);

    // Detect hover capability once on mount
    useEffect(() => {
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        setCanHover(mq.matches);
    }, []);

    // ── 3D Tilt Effect (desktop only) ──
    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLElement>, index: number) => {
            if (!canHover) return;

            const el = cardRefs.current[index];
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateX = ((y - rect.height / 2) / rect.height) * 8;
            const rotateY = ((rect.width / 2 - x) / rect.width) * 8;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translateY(-8px)`;
        },
        [canHover]
    );

    const handlePointerLeave = useCallback(
        (index: number) => {
            if (!canHover) return;

            const el = cardRefs.current[index];
            if (!el) return;

            el.style.transform = "";
        },
        [canHover]
    );

    return (
        <section className="lav-section" id="life-at-viramah">
            <div className="lav-container">
                {/* ── Header ── */}
                <motion.header
                    className="lav-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={headerVariants}
                >
                    <div className="lav-header-left">

                        <h2 className="lav-header-title">
                            Never a dull moment
                        </h2>
                        <p className="lav-subtitle">
                            From weekly meetups to game nights and skill workshops —
                            your stay with us will be the most memorable chapter of your student life.
                        </p>
                    </div>

                </motion.header>

                {/* ── Tectonic Grid ── */}
                <div className="lav-grid" role="group" aria-label="Life at Viramah gallery">
                    {GALLERY_ITEMS.map((item, i) => (
                        <motion.article
                            key={item.label}
                            className={`lav-slate lav-span-${item.span}`}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={cardVariants}
                            ref={(el: HTMLElement | null) => {
                                cardRefs.current[i] = el;
                            }}
                            onPointerMove={(e) => handlePointerMove(e, i)}
                            onPointerLeave={() => handlePointerLeave(i)}
                            tabIndex={0}
                            aria-label={`${item.title} — ${item.alt}`}
                            style={{ perspective: "1000px" }}
                        >
                            {/* Image */}
                            <div className="lav-image-wrapper">
                                <Image
                                    src={item.src}
                                    alt={item.alt}
                                    fill
                                    sizes={
                                        item.span === 12
                                            ? "(max-width: 767px) 90vw, (max-width: 1024px) 94vw, 1560px"
                                            : item.span === 8
                                                ? "(max-width: 767px) 90vw, (max-width: 1024px) 58vw, 65vw"
                                                : "(max-width: 767px) 90vw, (max-width: 1024px) 40vw, 33vw"
                                    }
                                    quality={85}
                                    className="lav-slate-img"
                                    loading="lazy"
                                />
                                {/* Displacement gradient */}
                                <div className="lav-displacement" />
                            </div>

                            {/* Content Overlay */}
                            <div className="lav-content">
                                <span className="lav-label">{item.label}</span>
                                <h3 className="lav-title">{item.title}</h3>
                                <div className="lav-stats">
                                    {item.stats.map((stat) => (
                                        <span key={stat}>{stat}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
