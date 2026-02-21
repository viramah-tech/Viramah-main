"use client";

import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SearchBar } from "@/components/search/SearchBar";
import { RoomCard } from "@/components/ui/RoomCard";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";

const ROOMS = [
    {
        title: "VIRAMAH STUDIO",
        type: "Studio · 1 Seater · AC",
        price: "₹17,749",
        tag: "Premium",
        amenities: ["AC", "High-Speed WiFi", "Study Desk", "Housekeeping"],
    },
    {
        title: "VIRAMAH AXIS",
        type: "Studio · 2 Seater · AC",
        price: "₹14,999",
        tag: "Luxury",
        amenities: ["AC", "High-Speed WiFi", "Study Desk", "Housekeeping"],
    },
    {
        title: "VIRAMAH STUDIO",
        type: "Studio · 1 Seater · Non-AC",
        price: "₹14,999",
        tag: "Comfort",
        amenities: ["High-Speed WiFi", "Study Desk", "Essential Living"],
    },
    {
        title: "VIRAMAH AXIS",
        type: "Studio · 2 Seater · Non-AC",
        price: "₹12,499",
        tag: "Best Value",
        amenities: ["High-Speed WiFi", "Study Desk", "Essential Living"],
    },
    {
        title: "VIRAMAH AXIS+",
        type: "1BHK · 2 Seater · Shared",
        price: "₹16,399",
        tag: "Exclusive",
        amenities: ["Spacious Living", "High-Speed WiFi", "Study Desk", "Kitchen"],
    },
    {
        title: "VIRAMAH COLLECTIVE+",
        type: "1BHK · 3 Seater · Shared",
        price: "₹11,499",
        tag: "Updated",
        amenities: ["Community Pick", "High-Speed WiFi", "Study Desk", "Kitchen"],
    },
    {
        title: "VIRAMAH NEXUS+",
        type: "1BHK · 4 Seater · Shared",
        price: "₹9,090",
        tag: "Budget Friendly",
        amenities: ["Shared Space", "High-Speed WiFi", "Study Desk", "Economy"],
    },
];

export default function RoomsPage() {
    return (
        <main className="min-h-screen flex flex-col" style={{ background: "var(--luxury-green)" }}>
            <Navigation />

            {/* Hero Header */}
            <section className="pt-36 pb-16 relative overflow-hidden">
                {/* Subtle background texture */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, var(--gold) 0%, transparent 50%),
                                          radial-gradient(circle at 80% 20%, var(--gold-antique) 0%, transparent 40%)`,
                    }}
                />
                <Container>
                    <div className="relative z-10">
                        <span
                            className="font-mono text-xs uppercase tracking-[0.25em] block mb-4"
                            style={{ color: "var(--gold)" }}
                        >
                            Krishna Valley, Vrindavan
                        </span>
                        <h1
                            className="font-display text-6xl md:text-8xl uppercase leading-[0.88] tracking-[-2px] mb-6"
                            style={{ color: "var(--cream-warm)" }}
                        >
                            Find Your
                            <br />
                            <span style={{ color: "var(--gold)" }}>Space</span>
                        </h1>
                        <p
                            className="font-body text-base md:text-lg max-w-md mt-6 leading-relaxed"
                            style={{ color: "var(--sand-light)", opacity: 0.6 }}
                        >
                            Thoughtfully designed spaces for focused individuals. Every layout is curated for deep work, rest, and community.
                        </p>

                        {/* Stats row */}
                        <div className="flex gap-10 mt-10">
                            {[
                                { label: "Studio & 1BHK Types", value: "7" },
                                { label: "Residents", value: "200+" },
                                { label: "Sq. Ft. (avg)", value: "240" },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div
                                        className="font-display text-3xl"
                                        style={{ color: "var(--gold)" }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div
                                        className="font-mono text-[0.65rem] uppercase tracking-widest mt-0.5"
                                        style={{ color: "var(--sand-light)", opacity: 0.5 }}
                                    >
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Search Bar */}
            <section className="relative z-20 pb-12">
                <Container>
                    <SearchBar />
                </Container>
            </section>

            {/* Divider */}
            <div className="w-full" style={{ height: "1px", background: "linear-gradient(to right, transparent, var(--gold-antique), transparent)", opacity: 0.3 }} />

            {/* Results Grid */}
            <section className="py-16">
                <Container>
                    {/* Section label */}
                    <div className="flex items-center justify-between mb-10">
                        <span
                            className="font-mono text-[0.7rem] uppercase tracking-[0.25em]"
                            style={{ color: "var(--gold)", opacity: 0.7 }}
                        >
                            {ROOMS.length} spaces available
                        </span>
                        <div
                            className="h-px flex-1 mx-6"
                            style={{ background: "var(--gold)", opacity: 0.15 }}
                        />
                        <span
                            className="font-mono text-[0.7rem] uppercase tracking-[0.25em]"
                            style={{ color: "var(--sand-light)", opacity: 0.4 }}
                        >
                            Sorted by price
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ROOMS.map((room) => (
                            <RoomCard
                                key={`${room.title}-${room.type}`}
                                title={room.title}
                                type={room.type}
                                price={room.price}
                                tag={room.tag}
                                amenities={room.amenities}
                                image=""
                            />
                        ))}
                    </div>
                </Container>
            </section>

            {/* Bottom CTA band */}
            <section
                className="py-16 mt-8"
                style={{
                    background: "linear-gradient(to right, var(--gold-antique), var(--gold))",
                }}
            >
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2
                                className="font-display text-3xl md:text-4xl"
                                style={{ color: "var(--luxury-green)" }}
                            >
                                Not sure which space fits?
                            </h2>
                            <p
                                className="font-mono text-sm mt-1"
                                style={{ color: "var(--luxury-green)", opacity: 0.7 }}
                            >
                                Schedule a free walkthrough — see it before you sign.
                            </p>
                        </div>
                        <EnquireNowButton variant="gold" label="Book a Visit" />
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
