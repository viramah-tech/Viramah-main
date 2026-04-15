"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import { ScheduleVisitButton } from "@/components/ui/ScheduleVisitButton";

// ─── Tile Data ──────────────────────────────────────────────
interface MarqueeTile {
    src: string;
    alt: string;
    title: string;
}

const TILES: MarqueeTile[] = [
    {
        src: "/diffrence section images/after (1).jpg",
        alt: "Viramah — modern living space transformation",
        title: "Living Space",
    },
    {
        src: "/life at viramah images/common area.jpg",
        alt: "Viramah — community common area",
        title: "Common Area",
    },
    {
        src: "/life at viramah images/gaming zone.jpg",
        alt: "Viramah — recreation gaming zone",
        title: "Gaming Zone",
    },
    {
        src: "/life at viramah images/swiming pool.jpg",
        alt: "Viramah — swimming pool wellness",
        title: "Swimming Pool",
    },
];

// Duplicate for seamless loop
const DOUBLED_TILES = [...TILES, ...TILES];

// ─── Animation Variants ─────────────────────────────────────
// Pure opacity fades — no upward bubble/rise movement
const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 1.2,
            ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
        },
    },
};

const metaVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 0.7,
        transition: {
            duration: 0.9,
            ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
            delay: 0.2,
        },
    },
};

const subtitleVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 0.65,
        transition: {
            duration: 0.9,
            ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
            delay: 0.4,
        },
    },
};

const stageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 1,
            ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
            delay: 0.6,
        },
    },
};

// ─── Component ──────────────────────────────────────────────
export function HeroSection() {
    const stageRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const [canHover, setCanHover] = useState(false);
    const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null);


    // ── JS marquee driver + drag/swipe momentum ──────────────────
    useEffect(() => {
        const el = marqueeRef.current;
        const stage = stageRef.current;
        if (!el || !stage) return;

        // Kill CSS animation — we drive translateX manually
        el.style.animation = "none";

        const isMobile = window.innerWidth < 768;
        // Slightly slower velocity on mobile so tiles don't fly past fingertips
        const BASE_VEL = isMobile ? 0.38 : 0.6;  // px/frame at native 60fps
        const DECAY = 0.92;  // momentum decay per frame (higher = longer glide)

        let position = 0;
        let velocity = 0;     // current momentum (negative = left)
        let isDragging = false;
        let lastX = 0;
        let lastTime = 0;
        let dragVel = 0;     // instantaneous drag velocity
        let loopWidth = 0;
        let rafId: number;
        let isHeroVisible = true; // track visibility for IntersectionObserver pause

        const measure = () => { loopWidth = el.scrollWidth / 2; };
        measure();
        window.addEventListener("resize", measure);

        // Use ResizeObserver to catch font/image loading size changes without layout thrashing
        const ro = new ResizeObserver(() => measure());
        ro.observe(el);

        // ── IntersectionObserver: pause RAF when hero scrolled off-screen ──
        // This eliminates 100% CPU usage from the loop while user reads other sections
        const visibilityObserver = new IntersectionObserver(
            ([entry]) => { isHeroVisible = entry.isIntersecting; },
            { threshold: 0 }
        );
        visibilityObserver.observe(stage);

        el.style.willChange = "transform";
        el.style.transform = "translate3d(0, 0, 0)"; // promote to GPU layer immediately

        // ── RAF tick — runs at native 60fps on all devices ───────
        const tick = () => {
            // Skip frame if hero is not visible — zero CPU while scrolled away
            if (!isHeroVisible) {
                rafId = requestAnimationFrame(tick);
                return;
            }

            // Optimization: Pause processing if a modal is open (overflow hidden)
            if (document.body.style.overflow === "hidden") {
                rafId = requestAnimationFrame(tick);
                return;
            }

            if (!isDragging) {
                // Decay drag momentum, blend toward base auto-scroll
                velocity += ((-BASE_VEL) - velocity) * (1 - DECAY);
                position += velocity;
            }
            // Seamless loop
            if (loopWidth > 0) {
                while (position <= -loopWidth) position += loopWidth;
                while (position > 0) position -= loopWidth;
            }
            // translate3d keeps animation fully on the GPU compositor thread
            el.style.transform = `translate3d(${position.toFixed(2)}px, 0, 0)`;
            rafId = requestAnimationFrame(tick);
        };
        // Seed velocity so it starts at base speed immediately
        velocity = -BASE_VEL;
        rafId = requestAnimationFrame(tick);

        // ── Pointer helpers ───────────────────────────────────
        const getClientX = (e: MouseEvent | TouchEvent) =>
            "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;

        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            isDragging = true;
            lastX = getClientX(e);
            lastTime = performance.now();
            dragVel = 0;
            stage.style.cursor = "grabbing";
            velocity = 0;
            // Prevent browser native drag / text selection
            if ("preventDefault" in e && e.type === "mousedown") e.preventDefault();
        };

        const onPointerMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return;
            // Prevent page scroll during touch swipe
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
            stage.style.cursor = "grab";
            velocity = dragVel;
        };

        // All events on stage — NOT window — so only the marquee area responds
        stage.addEventListener("mousedown", onPointerDown as EventListener);
        stage.addEventListener("mousemove", onPointerMove as EventListener);
        stage.addEventListener("mouseup", onPointerUp);
        stage.addEventListener("mouseleave", onPointerUp);   // cancel on exit
        stage.addEventListener("touchstart", onPointerDown as EventListener, { passive: true });
        stage.addEventListener("touchmove", onPointerMove as EventListener, { passive: false });
        stage.addEventListener("touchend", onPointerUp);

        // Initial cursor
        stage.style.cursor = "grab";

        return () => {
            ro.disconnect();
            visibilityObserver.disconnect();
            cancelAnimationFrame(rafId);
            el.style.willChange = "auto"; // release GPU layer on cleanup
            window.removeEventListener("resize", measure);
            stage.removeEventListener("mousedown", onPointerDown as EventListener);
            stage.removeEventListener("mousemove", onPointerMove as EventListener);
            stage.removeEventListener("mouseup", onPointerUp);
            stage.removeEventListener("mouseleave", onPointerUp);
            stage.removeEventListener("touchstart", onPointerDown as EventListener);
            stage.removeEventListener("touchmove", onPointerMove as EventListener);
            stage.removeEventListener("touchend", onPointerUp);
        };
    }, []);


    // ── Detect hover capability ─────────────────────────────
    useEffect(() => {
        const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
        const handler = (e: MediaQueryListEvent | MediaQueryList) => setCanHover(e.matches);
        handler(mql);
        mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
        return () => mql.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
    }, []);

    // ── Mobile Tap-to-Pause Handler ───────────────────────
    const handleTileTap = useCallback(
        (index: number) => {
            if (canHover) return; // Desktop uses CSS :hover

            if (activeTileIndex === index) {
                // Tap same tile again — deactivate & resume
                setActiveTileIndex(null);
                marqueeRef.current?.classList.remove("hero-marquee-paused");
            } else {
                // Tap new tile — activate & pause
                setActiveTileIndex(index);
                marqueeRef.current?.classList.add("hero-marquee-paused");
            }
        },
        [canHover, activeTileIndex]
    );

    return (
        <div className="hero-viewport">
            {/* ── Hero Header ──────────────────────────────── */}
            <header className="hero-header">
                <motion.div
                    className="hero-meta"
                    variants={metaVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <span>विरामाह — live life better </span>


                </motion.div>

                <motion.h1
                    className="hero-title"
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Per-letter spans: staggered flip-in entrance only */}
                    <span className="hero-title-letters">
                        {"viramah".split("").map((char, i) => (
                            <motion.span
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, rotateX: -60 },
                                    visible: {
                                        opacity: 1,
                                        rotateX: 0,
                                        transition: {
                                            duration: 0.9,
                                            ease: [0.23, 1, 0.32, 1],
                                            delay: i * 0.07,
                                        },
                                    },
                                }}
                                className="inline-block cursor-default select-none hero-title-char"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </span>

                    {/* Single whole-word span — background-clip:text works correctly
                        here because the text is a direct text node (not child spans).
                        Fades in after the entrance animation finishes (~1.5s). */}
                    <motion.span
                        className="hero-title-shimmer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.4, ease: "easeIn" }}
                        aria-hidden="true"
                    >
                        viramah
                    </motion.span>
                </motion.h1>

                <motion.div
                    className="hero-subtitle"
                    variants={subtitleVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        borderLeft: "3px solid #D8B56A",
                        paddingLeft: "1.5rem",
                        marginTop: ".5rem",
                        maxWidth: "600px",
                    }}
                >
                    <span style={{
                        fontFamily: "var(--font-display, serif)",
                        fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                        fontWeight: 400,
                        color: "#1a1a1a",
                        letterSpacing: "0.02em",
                        lineHeight: 1.3,
                        marginBottom: "0.8rem",
                        display: "block"
                    }}>
                        AAP BAS APNA DHYAN RAKHO, <br />BAKI SAB HAM SAMBHAL LENEGE.
                    </span>


                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                        display: "flex",
                        gap: "1rem",
                        marginTop: "1.5rem",
                        flexWrap: "wrap",
                    }}
                >


                </motion.div>
            </header>

            {/* ── Ribbon + Stage wrapper — animate both together ── */}
            <motion.div
                variants={stageVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ── Marquee Ribbon ──────────────────────────────── */}
                <div className="hero-ribbon" aria-hidden="true">
                    <div className="hero-ribbon-content">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="hero-ribbon-item">
                                <span>REGISTRATION OPENS FROM 27TH MARCH</span>
                                <span style={{ color: "#D8B56A" }}>✦</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Marquee Stage ───────────────────────────────── */}
                <div
                    className="hero-stage"
                    ref={stageRef}
                    role="region"
                    aria-label="Viramah spaces gallery carousel"
                    aria-roledescription="carousel"
                    style={{ userSelect: "none" }}
                >
                    {/* Decorative wires */}
                    <div className="hero-tensile-wire top" aria-hidden="true" />
                    <div className="hero-tensile-wire bottom" aria-hidden="true" />
                    <div
                        className="hero-anchor hero-anchor-tl"
                        aria-hidden="true"
                    />
                    <div
                        className="hero-anchor hero-anchor-tr"
                        aria-hidden="true"
                    />

                    {/* Edge masks */}
                    <div className="hero-mask-left" aria-hidden="true" />
                    <div className="hero-mask-right" aria-hidden="true" />

                    {/* Marquee track — speed boosts on scroll */}
                    <div className="hero-marquee" ref={marqueeRef}>
                        {DOUBLED_TILES.map((tile, i) => (
                            <div
                                className={`hero-tile${activeTileIndex === i ? " hero-tile-active" : ""}`}
                                key={`tile-${i}`}
                                onClick={() => handleTileTap(i)}
                            >
                                <Image
                                    src={tile.src}
                                    alt={tile.alt}
                                    fill
                                    sizes="(max-width: 374px) 70vw, (max-width: 767px) 65vw, (max-width: 1024px) 38vw, 420px"
                                    quality={80}
                                    className="hero-tile-img"
                                    loading={i === 0 ? "eager" : "lazy"}
                                    priority={i === 0}
                                    onLoad={(e) => {
                                        (e.currentTarget as HTMLImageElement).classList.add("img-loaded");
                                    }}
                                />
                                <div className="hero-tile-overlay">
                                    <div className="hero-tile-title">
                                        {tile.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
            <br />

        </div>
    );
}
