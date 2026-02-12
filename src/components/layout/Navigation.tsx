"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, memo, useRef } from "react";

interface NavLink {
    label: string;
    labelAlt: string;
    href: string;
}

const NAV_LINKS: NavLink[] = [
    { label: "Rooms", labelAlt: "Spaces", href: "/rooms" },
    { label: "Community", labelAlt: "Connect", href: "/community" },
    { label: "About", labelAlt: "Story", href: "/about" },
    { label: "Events", labelAlt: "Gather", href: "/events" },
];

// Clock Component - Isolated to prevent parent re-renders
const ClockDisplay = memo(function ClockDisplay() {
    const [currentTime, setCurrentTime] = useState<string>("00:00:00");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeStr =
                now.getHours().toString().padStart(2, '0') + ":" +
                now.getMinutes().toString().padStart(2, '0') + ":" +
                now.getSeconds().toString().padStart(2, '0');
            setCurrentTime(timeStr);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden lg:flex flex-col border-l border-gold/20 pl-4 ml-2">
            <span className="font-mono text-[0.65rem] text-ink/50" suppressHydrationWarning>{currentTime}</span>
            <span className="font-mono text-[0.65rem] text-gold">IST+5:30</span>
        </div>
    );
});

export function Navigation() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 pointer-events-none flex justify-center pt-10">
            <nav
                className={cn(
                    "pointer-events-auto relative flex items-center justify-between px-3 pl-6 pr-3 h-[70px] gap-6",
                    "bg-luxury-green border border-gold/30 rounded-full",
                    "shadow-[0_12px_40px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]",
                    "transition-all duration-500",
                    scrolled && "bg-luxury-green/80 backdrop-blur-md h-[60px]"
                )}
            >
                {/* Brand */}
                <Link href="/" className="group flex items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] group-hover:scale-110">
                        <img src="/logo.png" alt="Viramah Logo" className="w-full h-full object-contain" />
                    </div>

                </Link>

                {/* Links - Pure CSS hover */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full relative border border-white/5">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group/link relative px-5 py-2 rounded-full z-10 overflow-hidden"
                        >
                            {/* Background indicator */}
                            <div className="absolute inset-0 bg-white/10 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)] opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />

                            {/* Dual Text Container */}
                            <div className="relative h-5 overflow-hidden z-10">
                                <div className="flex flex-col transition-transform duration-300 ease-out group-hover/link:-translate-y-5">
                                    {/* Primary Label */}
                                    <span className="font-body text-sm font-medium text-off-white h-5 leading-5 whitespace-nowrap">
                                        {link.label}
                                    </span>
                                    {/* Secondary Label (Gold, Italic) */}
                                    <span className="font-body text-sm font-medium text-champagne-gold italic h-5 leading-5 whitespace-nowrap">
                                        {link.labelAlt}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>



                {/* CTA */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="px-5 py-2.5 rounded-full text-sm font-medium text-off-white/70 hover:text-off-white hover:bg-white/10 transition-colors hidden sm:block font-mono text-xs uppercase tracking-wider"
                    >
                        ALREADY A MEMBER
                    </Link>
                    <Link
                        href="/signup"
                        className="px-6 py-2.5 rounded-full text-sm font-medium bg-champagne-gold text-luxury-green shadow-lg shadow-champagne-gold/20 hover:bg-champagne-gold/90 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        NEW TO VIRAMAH
                    </Link>
                </div>
                {/* Mobile hamburger - shows links hidden on small screens */}
                <div className="md:hidden relative">
                    <MobileMenuButtonAndPanel navLinks={NAV_LINKS} />
                </div>
            </nav>
        </header>
    );
}

function MobileMenuButtonAndPanel({ navLinks }: { navLinks: NavLink[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                aria-expanded={open}
                aria-label="Open menu"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "inline-flex items-center justify-center p-2 rounded-full transition-all duration-300",
                    open ? "bg-luxury-green text-champagne-gold rotate-90" : "bg-white/10 hover:bg-white/20 text-off-white"
                )}
            >
                {open ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 top-full mt-4 w-80 bg-luxury-green border border-gold/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-4 flex flex-col gap-2 z-50 overflow-hidden origin-top-right backdrop-blur-xl"
                    >
                        {navLinks.map((l, i) => (
                            <motion.div
                                key={l.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                            >
                                <Link
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-off-white font-medium group-hover:text-champagne-gold transition-colors">{l.label}</span>
                                    <span className="text-xs text-champagne-gold/60 italic font-display tracking-wider group-hover:text-champagne-gold transition-colors">{l.labelAlt}</span>
                                </Link>
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent my-2"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider text-off-white/70 hover:text-off-white hover:bg-white/5 border border-white/5 transition-all"
                                >
                                    Log In
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link
                                    href="/signup"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider bg-champagne-gold text-luxury-green font-bold shadow-lg shadow-champagne-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Join
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
