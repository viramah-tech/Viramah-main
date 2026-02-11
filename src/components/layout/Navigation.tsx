"use client";

import Link from "next/link";
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
                    "bg-ivory border border-gold/30 rounded-full",
                    "shadow-[0_12px_40px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]",
                    "transition-all duration-500",
                    scrolled && "bg-ivory/80 backdrop-blur-md h-[60px]"
                )}
            >
                {/* Brand */}
                <Link href="/" className="group flex items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] group-hover:scale-110">
                        <img src="/logo.png" alt="Viramah Logo" className="w-full h-full object-contain" />
                    </div>
                    
                </Link>

                {/* Links - Pure CSS hover */}
                <div className="hidden md:flex items-center gap-1 bg-sand-light/50 p-1.5 rounded-full relative">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group/link relative px-5 py-2 rounded-full z-10 overflow-hidden"
                        >
                            {/* Background indicator */}
                            <div className="absolute inset-0 bg-ivory rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(197,160,89,0.2)] opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />

                            {/* Dual Text Container */}
                            <div className="relative h-5 overflow-hidden z-10">
                                <div className="flex flex-col transition-transform duration-300 ease-out group-hover/link:-translate-y-5">
                                    {/* Primary Label */}
                                    <span className="font-body text-sm font-medium text-ink h-5 leading-5 whitespace-nowrap">
                                        {link.label}
                                    </span>
                                    {/* Secondary Label (Gold, Italic) */}
                                    <span className="font-body text-sm font-medium text-gold italic h-5 leading-5 whitespace-nowrap">
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
                        className="px-5 py-2.5 rounded-full text-sm font-medium text-ink/70 hover:text-ink hover:bg-sand-dark/50 transition-colors hidden sm:block font-mono text-xs uppercase tracking-wider"
                    >
                        ALREADY A MEMBER
                    </Link>
                    <Link
                        href="/signup"
                        className="px-6 py-2.5 rounded-full text-sm font-medium bg-terracotta-raw text-white shadow-lg shadow-terracotta-raw/20 hover:bg-terracotta-raw/90 hover:-translate-y-0.5 transition-all duration-300"
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
                className="inline-flex items-center justify-center p-2 rounded-lg bg-ivory/80 "
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 7H20" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 12H20" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 17H20" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-ivory border border-gold/30 rounded-lg shadow-lg p-3 flex flex-col gap-2 z-50">
                    {navLinks.map((l) => (
                        <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-sand-light text-ink">
                            <div className="text-sm font-medium">{l.label}</div>
                            <div className="text-xs text-gold italic">{l.labelAlt}</div>
                        </Link>
                    ))}

                    <hr className="border-t border-gold/10 my-1" />

                    <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm text-ink/80 hover:bg-sand-light">
                        ALREADY A MEMBER
                    </Link>
                    <Link href="/signup" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm bg-terracotta-raw text-white text-center">
                        NEW TO VIRAMAH
                    </Link>
                </div>
            )}
        </div>
    );
}
