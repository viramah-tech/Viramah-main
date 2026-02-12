"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomCardProps {
    title: string;
    type: string;
    image: string;
    price: string;
    className?: string;
}

export function RoomCard({ title, type, price, className }: RoomCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["2deg", "-2deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-2deg", "2deg"]);

    // For room rotation on hover
    const roomRotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
    const roomRotateZ = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = event.clientX - rect.left - width / 2;
        const mouseYFromCenter = event.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "group relative w-full h-[500px] md:h-[640px] bg-pulp-base rounded-[4px] p-6 md:p-[60px]",
                "shadow-[-20px_-20px_60px_var(--pulp-highlight),20px_20px_60px_var(--pulp-shadow),inset_1px_1px_2px_var(--pulp-highlight),inset_-1px_-1px_2px_var(--pulp-shadow)]",
                "hover:z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-crosshair",
                className
            )}
        >
            {/* Content Container with 3D Depth */}
            <div
                className="relative w-full h-full flex flex-col justify-between"
                style={{ transform: "translateZ(20px)" }}
            >
                {/* Header */}
                <div className="z-10">
                    <span className="font-mono text-[0.75rem] text-card-accent tracking-[2px] uppercase block mb-2">
                        {type}
                    </span>
                    <h3 className="font-display text-[2.5rem] md:text-[3rem] text-ink-black leading-[0.9] uppercase tracking-[-2px]">
                        {title.split(" ").map((word, i) => (
                            <span key={i}>
                                {word}
                                {i < title.split(" ").length - 1 && <br />}
                            </span>
                        ))}
                    </h3>
                </div>

                {/* 3D Isometric Room Viewport */}
                <div
                    className="absolute top-1/2 left-1/2 w-[320px] h-[320px] -translate-x-1/2 -translate-y-[40%] scale-75 md:scale-100 origin-center"
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
                            className="absolute w-[240px] h-[240px] bottom-0 right-0 bg-pulp-base border border-black/5"
                            style={{
                                boxShadow: "inset 10px 10px 30px var(--pulp-shadow), inset -2px -2px 10px var(--pulp-highlight)",
                            }}
                        />

                        {/* Wall Left */}
                        <div
                            className="absolute w-[240px] h-[140px] right-0"
                            style={{
                                background: "linear-gradient(to bottom, var(--pulp-base), var(--pulp-shadow))",
                                transformOrigin: "bottom",
                                transform: "rotateX(-90deg)",
                                bottom: "240px",
                                border: "1px solid rgba(0,0,0,0.05)",
                            }}
                        />

                        {/* Wall Right */}
                        <div
                            className="absolute w-[140px] h-[240px] bottom-0"
                            style={{
                                background: "linear-gradient(to right, var(--pulp-shadow), var(--pulp-base))",
                                transformOrigin: "right",
                                transform: "rotateY(90deg)",
                                right: "240px",
                                border: "1px solid rgba(0,0,0,0.05)",
                            }}
                        />

                        {/* Plinth/Base Object */}
                        <div
                            className="absolute w-[60px] h-[60px] bg-pulp-base"
                            style={{
                                bottom: "60px",
                                right: "60px",
                                transform: "translateZ(2px)",
                                boxShadow: "10px 10px 20px rgba(0,0,0,0.1), -2px -2px 5px var(--pulp-highlight)",
                            }}
                        />

                        {/* Floating Cube with Animation */}
                        <motion.div
                            className="absolute w-[40px] h-[40px] bg-card-accent"
                            style={{
                                bottom: "70px",
                                right: "70px",
                            }}
                            animate={{
                                z: [80, 100, 80],
                            }}
                            transition={{
                                duration: 4,
                                ease: "easeInOut",
                                repeat: Infinity,
                            }}
                        />
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-pulp-shadow">
                            <span className="font-mono text-[0.7rem] leading-relaxed">

                                <span className="text-ink-black">KRISHNA VALLEY, VRINDAVAN</span>
                            </span>
                        </div>
                        <span className="font-mono text-[1rem] text-pulp-shadow">
                            PRICES<br />
                            <span className="text-ink-black">{price}/MO</span>
                        </span>
                    </div>

                    <button className="bg-ink-black text-pulp-base px-4 py-2 font-mono text-[0.7rem] font-bold tracking-[1px] hover:bg-card-accent hover:-translate-y-0.5 transition-all duration-300">
                        BOOK NOW
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
