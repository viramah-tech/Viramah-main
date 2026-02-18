"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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

    // ── Detect hover capability ─────────────────────────────
    useEffect(() => {
        setCanHover(
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
        );
    }, []);

    // ── Particle System ─────────────────────────────────────
    const createParticle = useCallback(() => {
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
            if (!canHover || !stageRef.current) return;

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
                    <span>विरामाह — The Art of REST</span>
                    <span>Community Living, Reimagined</span>
                    <span>© 2025 Viramah</span>
                </motion.div>

                <motion.h1
                    className="hero-title"
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    Viramah stays
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    variants={subtitleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    An intentional community-living experience designed for the
                    modern Indian journey.
                </motion.p>
            </header>

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

                {/* Marquee track */}
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
                                loading={i < 4 ? "eager" : "lazy"}
                                priority={i < 2}
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

            {/* ── Footer Blurbs ─────────────────────────────── */}
            <motion.div
                className="hero-blurbs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
            >
                <div className="hero-blurb">
                    <br />
                    <br />
                    <h3>The Promise</h3>
                    <p>
                        Premium community living spaces designed for connection,
                        growth, and the comfort of a second home.
                        <br />
                        <br />
                        <br />
                        <br />
                    </p>
                </div>
                <div className="hero-blurb">
                    <h3>The Experience</h3>
                    <p>
                        A seamless blend of private retreats and shared moments,
                        bound by thoughtful design and warm hospitality.
                        <br />
                        <br />
                        <br />
                        <br />
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
