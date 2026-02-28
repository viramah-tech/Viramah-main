"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";

interface RoomCardProps {
    title: string;
    type: string;
    image?: string;
    price: string;
    tag?: string;
    amenities?: string[];
    className?: string;
}

export function RoomCard({
    title,
    type,
    price,
    tag,
    amenities = [],
    className,
}: RoomCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
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

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "group relative w-full bg-cream-warm rounded-[4px] p-6 md:p-[48px] min-h-[540px] md:min-h-[600px]",
                "shadow-[-20px_-20px_60px_rgba(255,255,255,0.7),20px_20px_60px_rgba(0,0,0,0.35),inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(0,0,0,0.15)]",
                "hover:z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-crosshair",
                className
            )}
        >
            {/* Tag badge */}
            {tag && (
                <div
                    className="absolute top-5 right-5 z-20 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] font-bold"
                    style={{
                        background: "var(--luxury-green)",
                        color: "var(--gold)",
                    }}
                >
                    {tag}
                </div>
            )}

            {/* Content with 3D depth */}
            <div
                className="relative w-full h-full flex flex-col justify-between gap-6"
                style={{ transform: "translateZ(20px)" }}
            >
                {/* ── Header ── */}
                <div className="z-10">
                    <span className="font-mono text-[0.7rem] text-green-sage tracking-[2px] uppercase block mb-2">
                        {type}
                    </span>
                    <h3 className="font-display text-[2.4rem] md:text-[2.8rem] text-charcoal leading-[0.9] uppercase tracking-[-2px]">
                        {title.split(" ").map((word, i) => (
                            <span key={i}>
                                {word}
                                {i < title.split(" ").length - 1 && <br />}
                            </span>
                        ))}
                    </h3>
                </div>

                {/* ── 3D Isometric Room Viewport ── */}
                <div
                    className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-[42%] scale-[0.85] md:scale-100 origin-center"
                    style={{ perspective: "1200px" }}
                >
                    <motion.div
                        className="w-full h-full relative"
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

                {/* ── Amenities Toggle ── */}
                {amenities.length > 0 && (
                    <div className="z-20 mt-auto pt-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-charcoal/60 hover:text-charcoal transition-colors group/btn"
                        >
                            Amenities
                            <motion.span
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-[0.8rem] leading-none"
                            >
                                {">"}
                            </motion.span>
                        </button>

                        <motion.div
                            initial={false}
                            animate={{
                                height: isExpanded ? "auto" : 0,
                                opacity: isExpanded ? 1 : 0,
                                marginTop: isExpanded ? 16 : 0,
                            }}
                            className="overflow-hidden"
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

                {/* Spacer to push footer down */}
                <div className="flex-1" />

                {/* ── Footer ── */}
                <div className="flex justify-between items-end z-10">
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-[0.62rem] text-charcoal/40 uppercase tracking-widest">
                            Krishna Valley, Vrindavan
                        </span>
                        <div>
                            <span className="font-mono text-[0.6rem] text-charcoal/40">Starting from</span>
                            <br />
                            <span className="font-display text-[1.5rem] text-charcoal leading-tight">
                                {price}
                                <span className="font-mono text-[0.6rem] text-charcoal/40 ml-1">/mo</span>
                            </span>
                            <br />

                        </div>

                    </div>

                    <EnquireNowButton variant="dark" label="Book Now" />
                </div>
                <span className="font-mono text-[0.8rem] text-charcoal leading-[1.5] block"> Including Mess & All Amenities </span>

            </div>
        </motion.div>
    );
}
