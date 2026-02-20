"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function Footer() {
    const [utcTime, setUtcTime] = useState("00:00:00");
    const footerRef = useRef<HTMLElement>(null);

    // Live UTC clock — client-only, initialised as "00:00:00" to avoid SSR mismatch
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const h = String(now.getUTCHours()).padStart(2, "0");
            const m = String(now.getUTCMinutes()).padStart(2, "0");
            const s = String(now.getUTCSeconds()).padStart(2, "0");
            setUtcTime(`${h}:${m}:${s} UTC`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // Staggered scroll-reveal
    useEffect(() => {
        const footer = footerRef.current;
        if (!footer) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("footer-reveal-active");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.05 }
        );

        footer.querySelectorAll(".footer-reveal").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* SVG filter for woven texture distortion — unique ID avoids collision with global grain */}
            <svg
                style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
                aria-hidden="true"
            >
                <defs>
                    <filter id="rough-fiber-footer">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                    </filter>
                </defs>
            </svg>

            <footer ref={footerRef} className="woven-footer">


                {/* Main grid */}
                <div className="footer-grid">

                    {/* Brand column */}
                    <div className="footer-brand footer-reveal">
                        <div className="footer-logo">Viramah stay.</div>
                        <p className="footer-mission">
                            Premium student living reimagined — where comfort, community,
                            and craft come together. Every space designed with intention.
                        </p>
                        <div className="footer-contact">
                            <span className="flex items-center gap-2">
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=team@viramah.com" target="_blank" rel="noopener noreferrer">team@viramah.com</a>
                            </span>
                            <span className="flex items-center gap-2">
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <a href="tel:+918679001661">+91 8679001661</a>
                            </span>
                        </div>
                    </div>

                    {/* Navigate column */}
                    <div className="footer-nav-col footer-reveal" style={{ transitionDelay: "0.1s" }}>
                        <span className="footer-nav-label">Navigate</span>
                        <ul className="footer-nav-list">
                            <li><Link href="/rooms">Living Options</Link></li>
                            <li><Link href="/community">Community</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="#">Book a Visit</Link></li>
                            <li><Link href="#">Apply Now</Link></li>
                        </ul>
                    </div>

                    {/* Legal column */}
                    <div className="footer-nav-col footer-reveal" style={{ transitionDelay: "0.2s" }}>
                        <span className="footer-nav-label">Legal</span>
                        <ul className="footer-nav-list">
                            <li><Link href="#">Privacy Policy</Link></li>
                            <li><Link href="#">Terms of Service</Link></li>
                            <li><Link href="#">Support</Link></li>
                            <li><Link href="#">Login / Register</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom footer-reveal" style={{ transitionDelay: "0.3s" }}>
                    <div className="footer-meta">
                        <span>&copy; {new Date().getFullYear()} Viramah</span>
                        <span className="footer-clock">{utcTime}</span>
                        <span>Premium Student Living</span>
                    </div>

                    <div className="footer-socials">
                        <a href="#" aria-label="Instagram" className="footer-social-btn">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                            </svg>
                        </a>
                        <a href="#" aria-label="Facebook" className="footer-social-btn">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a2 2 0 0 1 2-2h2z" />
                            </svg>
                        </a>
                        <a href="#" aria-label="Twitter / X" className="footer-social-btn">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9.09 9.09 0 0 1-2.88 1.1A4.48 4.48 0 0 0 16.11 0c-2.5 0-4.5 2.01-4.5 4.5 0 .35.04.69.1 1.02A12.94 12.94 0 0 1 3 1.64a4.48 4.48 0 0 0-.61 2.27c0 1.57.8 2.96 2.02 3.77A4.48 4.48 0 0 1 2 7.14v.06c0 2.2 1.57 4.03 3.88 4.45a4.48 4.48 0 0 1-2.03.08c.57 1.78 2.23 3.08 4.19 3.12A9.05 9.05 0 0 1 1 19.54a12.94 12.94 0 0 0 7.03 2.06c8.44 0 13.07-7 13.07-13.07 0-.2 0-.39-.01-.58A9.32 9.32 0 0 0 23 3z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
