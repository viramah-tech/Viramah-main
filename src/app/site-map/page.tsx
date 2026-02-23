import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sitemap | Viramah Premium Student Living",
    description: "Full site map for Viramah. Navigate through our spaces, community, events, and legal information.",
};

const SITEMAP_SECTIONS = [
    {
        title: "Main Navigation",
        links: [
            { name: "Home", href: "/" },
            { name: "Living Options (Spaces)", href: "/rooms" },
            { name: "Community", href: "/community" },
            { name: "About Story", href: "/about" },
            { name: "Events & Gatherings", href: "/events" },
        ],
    },
    {
        title: "Resident Portal",
        links: [
            { name: "Login", href: "/login" },
            { name: "Create Account", href: "/signup" },
            { name: "Forgot Password", href: "/forgot-password" },
            { name: "Student Dashboard", href: "/student/dashboard" },
        ],
    },
    {
        title: "Legal & Support",
        links: [
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
            { name: "Support Center", href: "#" },
            { name: "Internal Sitemap (XML)", href: "/sitemap.xml" },
        ],
    },
    {
        title: "Direct Actions",
        links: [
            { name: "Book a Visit", href: "#" },
            { name: "Enquire Now", href: "#" },
            { name: "Contact Us", href: "mailto:team@viramahstay.com" },
        ],
    },
];

export default function SitemapPage() {
    return (
        <main className="min-h-screen bg-sand-light">
            <Navigation />

            <section className="pt-40 pb-20">
                <Container>
                    <header className="mb-16 border-l-4 border-gold pl-8">
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-terracotta-raw mb-3 block">Navigation Directory</span>
                        <h1 className="text-5xl md:text-7xl font-display text-charcoal uppercase leading-tight">
                            Website <br />
                            <span className="text-gold">Sitemap</span>
                        </h1>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {SITEMAP_SECTIONS.map((section) => (
                            <div key={section.title} className="flex flex-col gap-6">
                                <h2 className="font-mono text-[0.7rem] uppercase tracking-widest text-charcoal/40 border-b border-charcoal/10 pb-3">
                                    {section.title}
                                </h2>
                                <ul className="flex flex-col gap-4">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-lg text-charcoal/70 hover:text-terracotta-raw transition-colors duration-300 flex items-center group"
                                            >
                                                <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300 text-gold-antique">
                                                    →
                                                </span>
                                                <span className="group-hover:translate-x-1 transition-transform duration-300">
                                                    {link.name}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
