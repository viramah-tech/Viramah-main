"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STATUSES = [
    "Materializing Layers",
    "Parsing Vellum",
    "Stratifying Depth",
    "Refining Grain",
    "Calculating Displacement"
];

export default function Loading() {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 3;
                if (next >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Update status every 25%
                if (Math.floor(next / 25) > Math.floor(prev / 25)) {
                    setStatusIndex(s => (s + 1) % STATUSES.length);
                }
                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center overflow-hidden z-[99999]"
            style={{
                background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f0eb 100%)",
            }}
        >
            {/* Grain Overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04] z-[100]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* SVG Filter */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="vellum-displacement">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.015"
                            numOctaves="4"
                            result="noise"
                        >
                            <animate attributeName="seed" from="1" to="100" dur="10s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="12"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Scene */}
            <div className="relative w-[400px] h-[400px] flex items-center justify-center">
                {/* Displacement Layer Container */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ filter: "url(#vellum-displacement)" }}
                >
                    {/* Layer 1 - Outer */}
                    <motion.div
                        className="absolute w-[280px] h-[280px] bg-white/70 backdrop-blur-xl mix-blend-multiply"
                        style={{
                            borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%",
                            border: "1px solid rgba(220, 220, 210, 0.4)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                        }}
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{ rotate: { duration: 12, ease: "linear", repeat: Infinity }, scale: { duration: 6, repeat: Infinity } }}
                    />

                    {/* Layer 2 - Middle */}
                    <motion.div
                        className="absolute w-[240px] h-[260px] bg-[rgba(245,245,240,0.5)] backdrop-blur-xl mix-blend-multiply"
                        style={{
                            borderRadius: "50% 50% 45% 55% / 55% 45% 55% 45%",
                            border: "1px solid rgba(220, 220, 210, 0.4)",
                        }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    />

                    {/* Layer 3 - Inner */}
                    <motion.div
                        className="absolute w-[200px] h-[200px] bg-white/80 backdrop-blur-xl mix-blend-multiply"
                        style={{
                            borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%",
                            border: "2px solid rgba(255, 255, 255, 0.9)",
                        }}
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
                    />
                </div>

                {/* Data Overlay */}
                <div className="relative z-10 text-center pointer-events-none">
                    <div className="flex items-start justify-center">
                        <motion.span
                            className="text-[5rem] font-bold tracking-[-0.05em] text-[#1a1a1a] leading-none"
                            key={Math.floor(progress)}
                        >
                            {Math.floor(progress).toString().padStart(2, '0')}
                        </motion.span>
                        <span className="font-mono text-xl text-[#666666] mt-2 ml-1">%</span>
                    </div>

                    <div className="mt-5 flex flex-col items-center gap-1">
                        {/* Loading bar track */}
                        <div className="w-16 h-px bg-black/10 relative overflow-hidden my-3">
                            <motion.div
                                className="absolute h-full w-1/2 bg-[#1a1a1a]"
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                            />
                        </div>

                        <motion.span
                            className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#666666]"
                            key={statusIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {STATUSES[statusIndex]}
                        </motion.span>
                    </div>
                </div>
            </div>
        </div>
    );
}
