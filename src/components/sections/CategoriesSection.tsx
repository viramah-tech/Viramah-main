"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

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
    const marqueeRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    // ── Pure JS RAF + drag/swipe (same pattern as HeroSection) ──
    useEffect(() => {
        const el = marqueeRef.current;
        const wrap = wrapRef.current;
        if (!el || !wrap) return;

        // Kill CSS animation — we drive translateX manually
        el.style.animation = "none";

        const BASE_VEL = 0.5;   // px/frame auto-scroll at 60fps
        const DECAY = 0.92;  // momentum decay per frame

        let position = 0;
        let velocity = -BASE_VEL;
        let isDragging = false;
        let lastX = 0;
        let lastTime = 0;
        let dragVel = 0;
        let loopWidth = 0;
        let rafId: number;

        const measure = () => { loopWidth = el.scrollWidth / 2; };
        measure();
        window.addEventListener("resize", measure);

        // ── RAF tick ──────────────────────────────────────────
        const tick = () => {
            if (!isDragging) {
                velocity += ((-BASE_VEL) - velocity) * (1 - DECAY);
                position += velocity;
            }
            if (loopWidth > 0) {
                while (position <= -loopWidth) position += loopWidth;
                while (position > 0) position -= loopWidth;
            }
            el.style.transform = `translateX(${position.toFixed(2)}px)`;
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        // ── Pointer helpers ───────────────────────────────────
        const getClientX = (e: MouseEvent | TouchEvent) =>
            "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;

        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            isDragging = true;
            lastX = getClientX(e);
            lastTime = performance.now();
            dragVel = 0;
            velocity = 0;
            wrap.style.cursor = "grabbing";
            if (e.type === "mousedown") e.preventDefault();
        };

        const onPointerMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();
            const now = performance.now();
            const x = getClientX(e);
            const dx = x - lastX;
            const dt = Math.max(now - lastTime, 1);
            dragVel = (dx / dt) * 16.67;
            position += dx;
            lastX = x;
            lastTime = now;
        };

        const onPointerUp = () => {
            if (!isDragging) return;
            isDragging = false;
            wrap.style.cursor = "grab";
            velocity = dragVel;
        };

        // All events on wrap — NOT window
        wrap.addEventListener("mousedown", onPointerDown as EventListener);
        wrap.addEventListener("mousemove", onPointerMove as EventListener);
        wrap.addEventListener("mouseup", onPointerUp);
        wrap.addEventListener("mouseleave", onPointerUp);
        wrap.addEventListener("touchstart", onPointerDown as EventListener, { passive: true });
        wrap.addEventListener("touchmove", onPointerMove as EventListener, { passive: false });
        wrap.addEventListener("touchend", onPointerUp);

        wrap.style.cursor = "grab";

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", measure);
            wrap.removeEventListener("mousedown", onPointerDown as EventListener);
            wrap.removeEventListener("mousemove", onPointerMove as EventListener);
            wrap.removeEventListener("mouseup", onPointerUp);
            wrap.removeEventListener("mouseleave", onPointerUp);
            wrap.removeEventListener("touchstart", onPointerDown as EventListener);
            wrap.removeEventListener("touchmove", onPointerMove as EventListener);
            wrap.removeEventListener("touchend", onPointerUp);
        };
    }, []);

    return (
        <section
            className="cat-section"
            id="categories"
        >
            <div className="cat-container">
                {/* ── Marquee ── */}
                <div className="cat-marquee-wrap" ref={wrapRef} style={{ userSelect: "none" }}>
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
                                className="cat-tile"
                                aria-label={`${cat.title} — ${cat.count}`}
                                role="listitem"
                                draggable={false}
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
