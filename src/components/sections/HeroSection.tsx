"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";

// ─── Tile Data ──────────────────────────────────────────────
interface MarqueeTile {
    src: string;
    alt: string;
    meta: string;
    title: string;
}

const TILES: MarqueeTile[] = [
    {
        src: "/diffrence section images/after (1).jpg",
        alt: "Viramah — modern living space transformation",
        meta: "LIVING_SPACE",
        title: "Living Space",
    },
    {
        src: "/life at viramah images/common area.jpg",
        alt: "Viramah — community common area",
        meta: "THE_COMMONS",
        title: "Common Area",
    },
    {
        src: "/life at viramah images/gaming zone.jpg",
        alt: "Viramah — recreation gaming zone",
        meta: "RECREATION",
        title: "Gaming Zone",
    },
    {
        src: "/life at viramah images/swiming pool.jpg",
        alt: "Viramah — swimming pool wellness",
        meta: "AQUATICS",
        title: "Swimming Pool",
    },
];

// Duplicate for seamless loop
const DOUBLED_TILES = [...TILES, ...TILES];

// ─── Animation Variants ─────────────────────────────────────
const titleVariants = {
    hidden: { y: 120, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 1.4,
            ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
        },
    },
};

const metaVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 0.7,
        transition: {
            duration: 1,
            ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
            delay: 0.3,
        },
    },
};

const subtitleVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 0.65,
        transition: {
            duration: 1,
            ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
            delay: 0.5,
        },
    },
};

const stageVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 1,
            ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
            delay: 0.7,
        },
    },
};

// ─── Component ──────────────────────────────────────────────
export function HeroSection() {
    const stageRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement[]>([]);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const [canHover, setCanHover] = useState(false);
    const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null);


    // ── JS marquee driver + drag/swipe momentum ──────────────────
    useEffect(() => {
        const el = marqueeRef.current;
        const stage = stageRef.current;
        if (!el || !stage) return;

        // Kill CSS animation — we drive translateX manually
        el.style.animation = "none";

        const BASE_VEL = 0.6;   // px/frame auto-scroll at 60fps
        const DECAY = 0.92;  // momentum decay per frame (higher = longer glide)

        // 30fps cap on mobile — halves CPU usage while still looking smooth
        const isMobile = window.innerWidth < 768;
        const TARGET_FPS = isMobile ? 30 : 60;
        const FRAME_MS = 1000 / TARGET_FPS;

        let position = 0;
        let velocity = 0;     // current momentum (negative = left)
        let isDragging = false;
        let lastX = 0;
        let lastTime = 0;
        let dragVel = 0;     // instantaneous drag velocity
        let loopWidth = 0;
        let rafId: number;
        let lastFrameTs = 0;
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

        // ── RAF tick ──────────────────────────────────────────
        const tick = (ts: number) => {
            // Skip frame if hero is not visible — zero CPU while scrolled away
            if (!isHeroVisible) {
                rafId = requestAnimationFrame(tick);
                return;
            }

            // Mobile FPS cap — skip frames to hit target FPS
            if (ts - lastFrameTs < FRAME_MS) {
                rafId = requestAnimationFrame(tick);
                return;
            }
            lastFrameTs = ts;

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
            el.style.transform = `translateX(${position.toFixed(2)}px)`;
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
        setCanHover(
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
        );
    }, []);

    // ── Particle System ─────────────────────────────────────
    const createParticle = useCallback(() => {
        // Optimization: Don't spawn particles if modal is open
        if (document.body.style.overflow === "hidden") return;

        const particle = document.createElement("div");
        particle.className = "hero-particle";

        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;

        document.body.appendChild(particle);
        particlesRef.current.push(particle);

        const duration = Math.random() * 20000 + 10000;
        const animation = particle.animate(
            [
                { transform: "translate(0, 0) scale(1)", opacity: 0.4 },
                {
                    transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * -100 - 50}px) scale(0)`,
                    opacity: 0,
                },
            ],
            { duration, easing: "linear" }
        );

        animation.onfinish = () => {
            particle.remove();
            const idx = particlesRef.current.indexOf(particle);
            if (idx > -1) particlesRef.current.splice(idx, 1);
            createParticle();
        };
    }, []);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return;

        const width = window.innerWidth;
        let particleCount = 30;
        if (width < 375) particleCount = 8;
        else if (width < 768) particleCount = 15;
        else if (width < 1024) particleCount = 25;

        for (let i = 0; i < particleCount; i++) {
            const timer = setTimeout(createParticle, Math.random() * 5000);
            timersRef.current.push(timer);
        }

        return () => {
            timersRef.current.forEach(clearTimeout);
            particlesRef.current.forEach((p) => p.remove());
            particlesRef.current = [];
            timersRef.current = [];
        };
    }, [createParticle]);

    // ── Mouse Parallax on Stage (desktop only) ──────────────
    const handleStageMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!canHover || !stageRef.current || document.body.style.overflow === "hidden") return;

            const x = (e.clientX / window.innerWidth - 0.5) * 8;
            const y = (e.clientY / window.innerHeight - 0.5) * 4;

            stageRef.current.style.transform = `translate(${x}px, ${y}px)`;
        },
        [canHover]
    );

    const handleStageMouseLeave = useCallback(() => {
        if (stageRef.current) {
            stageRef.current.style.transform = "";
        }
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
                    {"viramah".split("").map((char, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 100, rotateX: -90 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    rotateX: 0,
                                    transition: {
                                        duration: 1,
                                        ease: [0.23, 1, 0.32, 1],
                                        delay: i * 0.08,
                                    },
                                },
                            }}
                            whileHover={{
                                y: -10,
                                color: "#D8B56A",
                                transition: { duration: 0.2 },
                            }}
                            className="inline-block cursor-default select-none hero-title-char"
                        >
                            {char}
                        </motion.span>
                    ))}
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
            </header>

            {/* ── Marquee Ribbon ────────────────────────────── */}
            <div className="hero-ribbon" aria-hidden="true">
                <div className="hero-ribbon-content">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="hero-ribbon-item">
                            <span>Viramah is coming soon in krishna valley vrindavan</span>
                            <span style={{ color: "#D8B56A" }}>✦</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Marquee Stage ─────────────────────────────── */}
            <motion.div
                className="hero-stage"
                ref={stageRef}
                variants={stageVariants}
                initial="hidden"
                animate="visible"
                onMouseMove={handleStageMouseMove}
                onMouseLeave={handleStageMouseLeave}
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
                            />
                            <div className="hero-tile-overlay">
                                <div className="hero-tile-meta">
                                    {tile.meta}
                                </div>
                                <div className="hero-tile-title">
                                    {tile.title}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
            <br />

        </div>
    );
}
