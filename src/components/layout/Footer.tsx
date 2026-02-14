"use client";
import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
    return (
        <footer className="bg-sand-light text-charcoal py-12 mt-16 border-t border-charcoal/10">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                    {/* Quick Links */}
                    <div>
                        <h3 className="font-display text-xl mb-4 text-terracotta">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/search" className="hover:text-terracotta transition-colors">Search PGs</Link></li>
                            <li><Link href="/visit" className="hover:text-terracotta transition-colors">Book a Visit</Link></li>
                            <li><Link href="/login" className="hover:text-terracotta transition-colors">Login/Register</Link></li>
                            <li><Link href="/support" className="hover:text-terracotta transition-colors">Support/Help</Link></li>
                            <li><Link href="/list-property" className="hover:text-terracotta transition-colors">List Your Property</Link></li>
                        </ul>
                    </div>

                    {/* Site Map */}
                    <div>
                        <h3 className="font-display text-xl mb-4 text-terracotta">Site Map</h3>
                        <ul className="space-y-2">
                            <li><Link href="/rooms" className="hover:text-terracotta transition-colors">Living Options</Link></li>
                            <li><Link href="/about" className="hover:text-terracotta transition-colors">About Us</Link></li>
                            <li><Link href="/community" className="hover:text-terracotta transition-colors">Community</Link></li>
                            <li><Link href="/resources" className="hover:text-terracotta transition-colors">Resources</Link></li>
                            <li><Link href="/legal" className="hover:text-terracotta transition-colors">Legal</Link></li>
                        </ul>
                    </div>

                    {/* Info Section */}
                    <div>
                        <h3 className="font-display text-xl mb-4 text-terracotta">Info</h3>
                        <div className="mb-2 font-serif text-2xl">Viramah</div>
                        <div className="mb-2 text-charcoal/70">Premium student living reimagined.</div>
                        <div className="mb-2 text-charcoal">Contact: <a href="mailto:info@viramah.com" className="hover:text-terracotta">info@viramah.com</a></div>
                        <div className="mb-2 text-charcoal">Phone: <a href="tel:+911234567890" className="hover:text-terracotta">+91 12345 67890</a></div>
                        <div className="flex space-x-4 mt-4">
                            <a href="#" aria-label="Instagram" className="hover:opacity-80"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg></a>
                            <a href="#" aria-label="Facebook" className="hover:opacity-80"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a2 2 0 0 1 2-2h2z" /></svg></a>
                            <a href="#" aria-label="Twitter" className="hover:opacity-80"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9.09 9.09 0 0 1-2.88 1.1A4.48 4.48 0 0 0 16.11 0c-2.5 0-4.5 2.01-4.5 4.5 0 .35.04.69.1 1.02A12.94 12.94 0 0 1 3 1.64a4.48 4.48 0 0 0-.61 2.27c0 1.57.8 2.96 2.02 3.77A4.48 4.48 0 0 1 2 7.14v.06c0 2.2 1.57 4.03 3.88 4.45a4.48 4.48 0 0 1-2.03.08c.57 1.78 2.23 3.08 4.19 3.12A9.05 9.05 0 0 1 1 19.54a12.94 12.94 0 0 0 7.03 2.06c8.44 0 13.07-7 13.07-13.07 0-.2 0-.39-.01-.58A9.32 9.32 0 0 0 23 3z" /></svg></a>
                        </div>
                        <div className="mt-4 text-xs text-charcoal/60">
                            <Link href="/privacy" className="hover:text-terracotta mr-4">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-terracotta">Terms of Service</Link>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center text-xs text-charcoal/50 font-mono">
                    &copy; {new Date().getFullYear()} Viramah. All rights reserved.
                </div>
            </Container>
        </footer>
    );
}
