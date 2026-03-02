"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";

interface RoomCardProps {
    title: string;
    type: string;
    images?: string[];
    price: string;
    tag?: string;
    amenities?: string[];
    featured?: boolean;
    className?: string;
}

export function RoomCard({
    title,
    type,
    price,
    tag,
    amenities = [],
    images = [],
    featured = false,
    className,
}: RoomCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["2deg", "-2deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-2deg", "2deg"]);

    const roomRotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
    const roomRotateZ = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        x.set((event.clientX - rect.left - width / 2) / width);
        y.set((event.clientY - rect.top - height / 2) / height);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const hasImages = images.length > 0;

    function prevImg(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentImg((i) => (i - 1 + images.length) % images.length);
    }

    function nextImg(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentImg((i) => (i + 1) % images.length);
    }

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "group relative w-full rounded-[6px] overflow-hidden",
                featured
                    ? "bg-[#fdf8ee]"
                    : "bg-[#f7f1e8]",
                featured
                    ? "shadow-[0_0_0_2px_#D8B56A,0_0_30px_rgba(216,181,106,0.35),-12px_-12px_40px_rgba(255,255,255,0.6),16px_16px_50px_rgba(0,0,0,0.28)]"
                    : "shadow-[-12px_-12px_40px_rgba(255,255,255,0.6),16px_16px_50px_rgba(0,0,0,0.28),inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(0,0,0,0.12)]",
                "hover:z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-crosshair",
                className
            )}
        >
            {/* ── Most Popular corner ribbon (featured only) ── */}
            {featured && (
                <div
                    className="absolute top-0 right-0 z-30 overflow-hidden"
                    style={{ width: 120, height: 120, pointerEvents: "none" }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 28,
                            right: -32,
                            width: 140,
                            background: "linear-gradient(135deg, #D8B56A, #c9a04f)",
                            color: "#1a3328",
                            fontSize: "0.58rem",
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 800,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            textAlign: "center",
                            padding: "5px 0",
                            transform: "rotate(45deg)",
                            boxShadow: "0 3px 14px rgba(0,0,0,0.25)",
                        }}
                    >
                        ⭐ Popular
                    </div>
                </div>
            )}

            {/* Tag badge */}
            {tag && (
                <div
                    className="absolute top-4 left-4 z-20 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] font-bold rounded-[3px]"
                    style={{
                        background: featured ? "#D8B56A" : "var(--luxury-green)",
                        color: featured ? "#1a3328" : "var(--gold)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    }}
                >
                    {tag}
                </div>
            )}

            {/* ── Content wrapper ── */}
            <div
                className="relative w-full h-full flex flex-col"
                style={{ transform: "translateZ(20px)" }}
            >
                {/* ── Full-bleed image carousel ── */}
                {hasImages ? (
                    <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] overflow-hidden shrink-0">
                        {/* Skeleton shimmer shown while loading */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: "linear-gradient(110deg, #1e3529 30%, #2a4a38 50%, #1e3529 70%)",
                                backgroundSize: "200% 100%",
                                animation: "tileShimmer 1.6s ease-in-out infinite",
                            }}
                        />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImg}
                                className="w-full h-full relative"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <Image
                                    src={images[currentImg]}
                                    alt={`${title} – photo ${currentImg + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 680px"
                                    onLoad={(e) => {
                                        (e.currentTarget as HTMLImageElement).classList.add("img-loaded");
                                    }}
                                />
                                {/* Rich gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                                {/* Photo count badge */}
                                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                    <span className="font-mono text-white/80 text-[0.55rem] tracking-widest">{currentImg + 1} / {images.length}</span>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Prev / Next arrows — larger, more visible */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImg}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/45 hover:bg-black/70 text-white rounded-full text-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/10"
                                    aria-label="Previous photo"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={nextImg}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/45 hover:bg-black/70 text-white rounded-full text-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/10"
                                    aria-label="Next photo"
                                >
                                    ›
                                </button>

                                {/* Dot indicators */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                                            className={cn(
                                                "rounded-full transition-all duration-300",
                                                i === currentImg
                                                    ? "bg-white w-4 h-1.5"
                                                    : "bg-white/45 w-1.5 h-1.5"
                                            )}
                                            aria-label={`Photo ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div
                        className="relative w-full h-[300px] flex items-center justify-center overflow-hidden bg-[#1a3028] shrink-0"
                        style={{ perspective: "1200px" }}
                    >
                        <motion.div
                            className="w-[280px] h-[280px] relative scale-[0.82]"
                            style={{
                                transformStyle: "preserve-3d",
                                rotateX: useTransform(roomRotateX, (v) => 60 + v),
                                rotateZ: useTransform(roomRotateZ, (v) => 45 + v),
                            }}
                        >
                            {/* Floor */}
                            <div
                                className="absolute w-[220px] h-[220px] bottom-0 right-0 bg-cream-warm border border-black/5"
                                style={{
                                    boxShadow: "inset 10px 10px 30px var(--pulp-shadow), inset -2px -2px 10px var(--pulp-highlight)",
                                }}
                            />
                            {/* Wall Left */}
                            <div
                                className="absolute w-[220px] h-[130px] right-0"
                                style={{
                                    background: "linear-gradient(to bottom, var(--cream-warm), var(--pulp-shadow))",
                                    transformOrigin: "bottom",
                                    transform: "rotateX(-90deg)",
                                    bottom: "220px",
                                    border: "1px solid rgba(0,0,0,0.05)",
                                }}
                            />
                            {/* Wall Right */}
                            <div
                                className="absolute w-[130px] h-[220px] bottom-0"
                                style={{
                                    background: "linear-gradient(to right, var(--pulp-shadow), var(--cream-warm))",
                                    transformOrigin: "right",
                                    transform: "rotateY(90deg)",
                                    right: "220px",
                                    border: "1px solid rgba(0,0,0,0.05)",
                                }}
                            />
                            {/* Plinth */}
                            <div
                                className="absolute w-[55px] h-[55px] bg-cream-warm"
                                style={{
                                    bottom: "55px",
                                    right: "55px",
                                    transform: "translateZ(2px)",
                                    boxShadow: "8px 8px 18px rgba(0,0,0,0.1), -2px -2px 5px var(--pulp-highlight)",
                                }}
                            />
                            {/* Floating Cube */}
                            <motion.div
                                className="absolute w-[36px] h-[36px]"
                                style={{
                                    bottom: "64px",
                                    right: "64px",
                                    background: "var(--luxury-green)",
                                }}
                                animate={{ z: [70, 90, 70] }}
                                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                            />
                        </motion.div>
                    </div>
                )}

                {/* ── Text content below image ── */}
                <div className="flex flex-col gap-4 px-5 py-5">
                    {/* Header */}
                    <div>
                        <span className="font-mono text-[0.65rem] text-green-sage tracking-[2px] uppercase block mb-1.5 opacity-70">
                            {type}
                        </span>
                        <h3 className="font-display text-[2rem] md:text-[2.4rem] text-charcoal leading-[0.9] uppercase tracking-[-1.5px]">
                            {title.split(" ").map((word, i) => (
                                <span key={i}>
                                    {word}
                                    {i < title.split(" ").length - 1 && <br />}
                                </span>
                            ))}
                        </h3>
                    </div>

                    {/* ── Amenities Toggle ── */}
                    {amenities.length > 0 && (
                        <div className="pt-1">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-charcoal/60 hover:text-charcoal transition-colors"
                            >
                                Amenities
                                <motion.span
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-[0.8rem] leading-none ml-0.5"
                                >
                                    {"›"}
                                </motion.span>
                            </button>

                            <motion.div
                                initial={false}
                                animate={{
                                    height: isExpanded ? "auto" : 0,
                                    opacity: isExpanded ? 1 : 0,
                                    marginTop: isExpanded ? 10 : 0,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {amenities.map((a) => (
                                        <div key={a} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-luxury-green/30" />
                                            <span className="font-mono text-[0.58rem] uppercase tracking-wider text-charcoal/50">
                                                {a}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* ── Footer ── */}
                    <div className="flex justify-between items-end pt-1 border-t border-black/6 mt-auto">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[0.58rem] text-charcoal/35 uppercase tracking-widest">
                                Krishna Valley, Vrindavan
                            </span>
                            <span className="font-mono text-[0.58rem] text-charcoal/40">Starting from</span>
                            <span className="font-display text-[1.7rem] text-charcoal leading-tight">
                                {price}
                                <span className="font-mono text-[0.58rem] text-charcoal/40 ml-1">/mo</span>
                            </span>
                        </div>
                        <EnquireNowButton variant="dark" label="Book Now" />
                    </div>
                    <span className="font-mono text-[0.72rem] text-charcoal/40 leading-[1.5]">Including Mess &amp; All Amenities*</span>
                </div>
            </div>
        </motion.div>
    );
}
