"use client";

import Link from "next/link";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, memo, useRef } from "react";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";

interface NavLink {
    label: string;
    labelAlt: string;
    href: string;
}

const NAV_LINKS: NavLink[] = [
    { label: "Spaces", labelAlt: "Studios", href: "/rooms" },
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
        <header className="fixed top-0 left-0 w-full z-[1000] pointer-events-none flex justify-center pt-4 md:pt-10">
            <nav
                className={cn(
                    "pointer-events-auto relative flex items-center justify-between px-2 pl-4 md:px-3 md:pl-6 md:pr-3 h-[60px] md:h-[70px] gap-2 md:gap-6",
                    "bg-luxury-green border border-white/10 rounded-full",
                    "shadow-[0_12px_40px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]",
                    "transition-all duration-500 mx-4 md:mx-0",
                    scrolled && "bg-luxury-green/90 backdrop-blur-md h-[55px] md:h-[60px]"
                )}
            >
                {/* Brand */}
                <Link href="/" className="group flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] group-hover:scale-110">
                        <NextImage
                            src="/logo.png"
                            alt="Viramah Logo"
                            width={40}
                            height={40}
                            priority
                            className="w-full h-full object-contain"
                        />
                    </div>
                </Link>

                {/* Links - Pure CSS hover */}
                <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1.5 rounded-full relative border border-white/5">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group/link relative px-4 xl:px-5 py-2 rounded-full z-10 overflow-hidden"
                        >
                            {/* Background indicator */}
                            <div className="absolute inset-0 bg-white/10 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)] opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />

                            {/* Dual Text Container */}
                            <div className="relative h-5 overflow-hidden z-10">
                                <div className="flex flex-col transition-transform duration-300 ease-out group-hover/link:-translate-y-5">
                                    {/* Primary Label */}
                                    <span className="font-body text-[13px] xl:text-sm font-medium text-sand-light h-5 leading-5 whitespace-nowrap">
                                        {link.label}
                                    </span>
                                    {/* Secondary Label (Gold, Italic) */}
                                    <span className="font-body text-[13px] xl:text-sm font-medium text-gold-antique italic h-5 leading-5 whitespace-nowrap">
                                        {link.labelAlt}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2">
                    {/* 
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-full text-sm font-medium text-sand-light/70 hover:text-sand-light hover:bg-white/10 transition-colors hidden xl:block font-mono text-[10px] uppercase tracking-wider"
                    >
                        ALREADY A MEMBER
                    </Link>
                    <Link
                        href="/signup"
                        className="px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[11px] md:text-sm font-bold bg-green-sage text-white shadow-lg shadow-green-sage/20 hover:bg-green-sage/90 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap uppercase tracking-tight"
                    >
                        JOIN NOW
                    </Link>
                    */}
                    <EnquireNowButton variant="gold" label="join us" rounded={true} />
                </div>
                {/* Mobile hamburger */}
                <div className="lg:hidden relative">
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
                    "inline-flex items-center justify-center gap-2 pl-4 pr-3 py-2 rounded-full transition-all duration-500",
                    open
                        ? "bg-gold text-luxury-green scale-95 shadow-inner"
                        : "bg-white/5 hover:bg-white/10 text-sand-light border border-white/10"
                )}
            >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                    {open ? "Close" : "Menu"}
                </span>
                <div className="relative w-5 h-5 flex flex-col items-center justify-center gap-1.5">
                    <motion.span
                        animate={open ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                        className="w-4 h-0.5 bg-current rounded-full transition-transform"
                    />
                    <motion.span
                        animate={open ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                        className="w-4 h-0.5 bg-current rounded-full transition-all"
                    />
                    <motion.span
                        animate={open ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                        className="w-4 h-0.5 bg-current rounded-full transition-transform"
                    />
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 top-full mt-3 w-72 bg-luxury-green border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-3 flex flex-col gap-1 z-50 overflow-hidden origin-top-right backdrop-blur-2xl"
                    >
                        {navLinks.map((l, i) => (
                            <motion.div
                                key={l.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.04 }}
                            >
                                <Link
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="group flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    <span className="text-sand-light/90 font-medium text-sm group-hover:text-gold transition-colors">{l.label}</span>
                                    <span className="text-[10px] text-gold/40 italic font-mono uppercase tracking-widest group-hover:text-gold transition-colors">{l.labelAlt}</span>
                                </Link>
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-1"
                        >
                            <EnquireNowButton variant="gold" label="Book a Space" rounded={true} className="w-full" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

