"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function Footer() {
    const [utcTime, setUtcTime] = useState("00:00 UTC");
    const [mapLoaded, setMapLoaded] = useState(false);
    const footerRef = useRef<HTMLElement>(null);
    const mapWrapRef = useRef<HTMLDivElement>(null);

    // Live UTC clock — client-only, initialised as "00:00:00" to avoid SSR mismatch
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const h = String(now.getUTCHours()).padStart(2, "0");
            const m = String(now.getUTCMinutes()).padStart(2, "0");
            // HH:MM UTC — per-minute update saves 59/60 renders vs per-second
            setUtcTime(`${h}:${m} UTC`);
        };
        tick();
        const id = setInterval(tick, 60000); // every minute
        return () => clearInterval(id);
    }, []);

    // Staggered scroll-reveal + lazy map loading
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

        // Lazy-load Google Maps iframe only when map wrapper enters viewport
        // Defers ~500KB of Google Maps JS until user scrolls to footer
        const mapObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setMapLoaded(true);
                    mapObserver.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (mapWrapRef.current) mapObserver.observe(mapWrapRef.current);

        return () => {
            observer.disconnect();
            mapObserver.disconnect();
        };
    }, []);

    return (
        <footer ref={footerRef} className="lux-footer">

            {/* Grain texture noise overlay */}
            <div className="lux-footer-grain" aria-hidden="true" />

            {/* Decorative gold rule top */}
            <div className="lux-footer-rule" aria-hidden="true">
                <span className="lux-footer-rule-dot" />
                <span className="lux-footer-rule-line" />
                <span className="lux-footer-rule-dot" />
            </div>

            {/* ── Main grid ── */}
            <div className="lux-footer-grid">

                {/* Brand column */}
                <div className="lux-footer-brand footer-reveal">
                    <div className="lux-footer-logo">Viramah<span>stay.</span></div>
                    <p className="lux-footer-mission">
                        Premium student living reimagined — where comfort, community,
                        and craft converge. Every space designed with intention.
                    </p>

                    {/* Contact */}
                    <div className="lux-footer-contact">
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=support@viramahstay.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lux-footer-contact-row"
                        >
                            <span className="lux-footer-contact-icon">
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </span>
                            support@viramahstay.com
                        </a>
                        <a
                            href="https://wa.me/918679001662"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lux-footer-contact-row"
                            aria-label="Chat on WhatsApp"
                        >
                            <span className="lux-footer-contact-icon">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                                </svg>
                            </span>
                            +91 8679001662
                        </a>
                        <a href="tel:+918679001661" className="lux-footer-contact-row">
                            <span className="lux-footer-contact-icon">
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </span>
                            +91 8679001661
                        </a>
                    </div>

                    {/* Social icons */}
                    <div className="lux-footer-socials">
                        <a href="#" aria-label="Instagram" className="lux-footer-social-btn">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                            </svg>
                        </a>
                        <a href="#" aria-label="Facebook" className="lux-footer-social-btn">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a2 2 0 0 1 2-2h2z" />
                            </svg>
                        </a>
                        <a href="#" aria-label="Twitter / X" className="lux-footer-social-btn">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9.09 9.09 0 0 1-2.88 1.1A4.48 4.48 0 0 0 16.11 0c-2.5 0-4.5 2.01-4.5 4.5 0 .35.04.69.1 1.02A12.94 12.94 0 0 1 3 1.64a4.48 4.48 0 0 0-.61 2.27c0 1.57.8 2.96 2.02 3.77A4.48 4.48 0 0 1 2 7.14v.06c0 2.2 1.57 4.03 3.88 4.45a4.48 4.48 0 0 1-2.03.08c.57 1.78 2.23 3.08 4.19 3.12A9.05 9.05 0 0 1 1 19.54a12.94 12.94 0 0 0 7.03 2.06c8.44 0 13.07-7 13.07-13.07 0-.2 0-.39-.01-.58A9.32 9.32 0 0 0 23 3z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Navigate column */}
                <div className="lux-footer-nav-col footer-reveal" style={{ transitionDelay: "0.1s" }}>
                    <span className="lux-footer-nav-label">Navigate</span>
                    <ul className="lux-footer-nav-list">
                        <li><Link href="/rooms">Living Options</Link></li>
                        <li><Link href="/community">Community</Link></li>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="#">Book a Visit</Link></li>
                        <li><Link href="#">Apply Now</Link></li>
                    </ul>
                </div>

                {/* Legal column */}
                <div className="lux-footer-nav-col footer-reveal" style={{ transitionDelay: "0.2s" }}>
                    <span className="lux-footer-nav-label">Legal</span>
                    <ul className="lux-footer-nav-list">
                        <li><Link href="#">Privacy Policy</Link></li>
                        <li><Link href="#">Terms of Service</Link></li>
                        <li><Link href="#">Support</Link></li>
                        <li><Link href="#">Login / Register</Link></li>
                        <li><Link href="/site-map">Sitemap</Link></li>
                    </ul>
                </div>

                {/* Location / Find Us column */}
                <div className="lux-footer-location footer-reveal" style={{ transitionDelay: "0.3s" }}>
                    <span className="lux-footer-nav-label">Find Us</span>

                    {/* Embedded map — lazy-loaded when footer enters viewport */}
                    <div className="lux-footer-map-wrapper" ref={mapWrapRef}>
                        {mapLoaded ? (
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3548.3999999999996!2d77.6116949!3d27.5733148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736d6c12990b97%3A0xcdeab523fe2de96f!2sViramah%20Stays!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                width="100%"
                                height="155"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Viramah Stays on Google Maps"
                                className="lux-footer-map-iframe"
                            />
                        ) : (
                            // Placeholder shown before map loads — prevents layout shift
                            <div
                                style={{
                                    height: 155,
                                    background: "rgba(192, 122, 90, 0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 12,
                                }}
                            >
                                <span style={{ fontSize: "0.65rem", opacity: 0.35, fontFamily: "var(--font-mono, monospace)" }}>LOCATING...</span>
                            </div>
                        )}
                        {/* Overlay gradient + pulsing pin */}
                        <div className="lux-footer-map-overlay">
                            <span className="lux-footer-map-pulse" />
                        </div>
                    </div>

                    {/* Address card */}
                    <div className="lux-footer-address-card">
                        <div className="lux-footer-address-icon">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <div className="lux-footer-address-text">
                            <strong>Viramah Stays</strong>
                            <span>Krishna Valley, Jait, Vrindavan</span>
                            <span>Uttar Pradesh, India — 281406</span>
                        </div>
                    </div>

                    <a
                        href="https://www.google.com/maps/place/Viramah+Stays/@27.5733148,77.6116949,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lux-footer-directions-btn"
                    >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                        Get Directions
                    </a>
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="lux-footer-bottom footer-reveal" style={{ transitionDelay: "0.45s" }}>
                <div className="lux-footer-meta">
                    <span>&copy; {new Date().getFullYear()} Viramah</span>
                    <span className="lux-footer-dot" aria-hidden="true" />
                    <span className="lux-footer-clock">{utcTime}</span>
                    <span className="lux-footer-dot" aria-hidden="true" />
                    <span>Premium Student Living</span>
                </div>
                <div className="lux-footer-craft">
                    Crafted with intention in India
                </div>
            </div>
        </footer>
    );
}
