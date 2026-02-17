"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// ─── Gallery Data ───────────────────────────────────────────
interface GalleryItem {
    src: string;
    alt: string;
    caption: string;
    style?: React.CSSProperties;
}

const GALLERY_ITEMS: GalleryItem[] = [
    {
        src: "/diffrence section images/after (2).jpg",
        alt: "Viramah living spaces — premium community living",
        caption: "01 // LIVING_SPACE",
        style: { aspectRatio: "16/9", width: "40vw" },
    },
    {
        src: "/life at viramah images/common area.jpg",
        alt: "Viramah common area — community gathering space",
        caption: "02 // COMMON_AREA",
        style: { aspectRatio: "16/9", width: "45vw" },
    },
    {
        src: "/life at viramah images/gaming zone.jpg",
        alt: "Viramah gaming zone — recreation and leisure",
        caption: "03 // RECREATION_ZONE",
        style: { aspectRatio: "16/9", width: "40vw" },
    },
    {
        src: "/life at viramah images/swiming pool.jpg",
        alt: "Viramah swimming pool — wellness amenities",
        caption: "04 // AQUA_WELLNESS",
        style: { aspectRatio: "16/9", width: "35vw" },
    },
];

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

// ─── Component ──────────────────────────────────────────────
export function HeroSection() {
    const galleryRef = useRef<HTMLElement>(null);
    const particlesRef = useRef<HTMLDivElement[]>([]);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    // ── Particle System ──────────────────────────────────────
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
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return; // No particles for reduced motion

        // Tiered particle count by viewport width
        const width = window.innerWidth;
        let particleCount = 30; // Desktop
        if (width < 375) particleCount = 8;       // XS phone
        else if (width < 768) particleCount = 15; // Phone
        else if (width < 1024) particleCount = 25; // Tablet

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

    // ── Parallax Effect (desktop only) ──────────────────────
    useEffect(() => {
        // Disable parallax on mobile — causes scroll jank
        const isMobile = window.innerWidth < 768;
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (isMobile || prefersReducedMotion) return;

        const handleScroll = () => {
            if (!galleryRef.current) return;
            const images = galleryRef.current.querySelectorAll<HTMLImageElement>(
                ".hero-gallery-img"
            );
            images.forEach((img) => {
                const parent = img.parentElement;
                if (!parent) return;
                const rect = parent.getBoundingClientRect();
                const offset = rect.top * 0.1;
                img.style.transform = `translateY(${offset}px) scale(1.2)`;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ── Scroll Reveal Fallback (Intersection Observer) ───────
    useEffect(() => {
        // Check if CSS scroll-driven animations are supported
        const supportsScrollTimeline =
            typeof CSS !== "undefined" &&
            CSS.supports &&
            CSS.supports("animation-timeline", "--item");

        if (supportsScrollTimeline) return; // CSS handles it natively

        // Fallback: add class for transition-based reveal
        const items = document.querySelectorAll(".hero-reveal");
        items.forEach((el) => el.classList.add("hero-reveal-fallback"));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("hero-revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        items.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // ── Edge-Fade Vignette (scroll-driven) ──────────────────
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return;

        let rafId: number;

        const updateVignettes = () => {
            if (!galleryRef.current) {
                rafId = requestAnimationFrame(updateVignettes);
                return;
            }

            const wrappers =
                galleryRef.current.querySelectorAll<HTMLElement>(
                    ".hero-image-wrapper"
                );
            const vh = window.innerHeight;
            const enterZone = vh * 0.85; // bottom 15% = entering
            const exitZone = vh * 0.15;  // top 15% = exiting

            wrappers.forEach((wrapper) => {
                const rect = wrapper.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;

                // Remove all states first
                wrapper.classList.remove(
                    "hero-img-entering",
                    "hero-img-visible",
                    "hero-img-exiting"
                );

                if (rect.bottom < 0 || rect.top > vh) {
                    // Fully off-screen — no class
                    return;
                }

                if (centerY > enterZone) {
                    // Entering from bottom
                    wrapper.classList.add("hero-img-entering");
                } else if (centerY < exitZone) {
                    // Exiting at top
                    wrapper.classList.add("hero-img-exiting");
                } else {
                    // Fully visible
                    wrapper.classList.add("hero-img-visible");
                }
            });

            rafId = requestAnimationFrame(updateVignettes);
        };

        rafId = requestAnimationFrame(updateVignettes);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <div className="hero-viewport">
            {/* ── Sticky Hero Header ──────────────────────────── */}
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
                    Viramah
                    <br />
                    Living
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    variants={subtitleVariants}
                    initial="hidden"
                    animate="visible"
                >
                    An intentional community-living experience designed for the modern
                    Indian journey.
                </motion.p>
            </header>

            {/* ── Scroll Gallery ──────────────────────────────── */}
            <section className="hero-gallery" ref={galleryRef}>
                {GALLERY_ITEMS.map((item, i) => (
                    <div className="hero-scroll-item hero-reveal" key={i}>
                        <div className="hero-image-wrapper" style={item.style}>
                            <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                sizes="(max-width: 374px) 90vw, (max-width: 767px) 85vw, (max-width: 1024px) 55vw, 45vw"
                                quality={85}
                                className="hero-gallery-img"
                                loading={i === 0 ? "eager" : "lazy"}
                                priority={i === 0}
                            />
                            <div className="hero-caption">{item.caption}</div>
                        </div>
                    </div>
                ))}

                {/* Gallery End Marker */}

                <div className="hero-gallery-end-title">Begin Your Journey</div>
                <div className="hero-gallery-end-meta">
                    <span>Viramah Residences</span>
                    <span>India</span>
                </div>

            </section>
        </div>
    );
}
