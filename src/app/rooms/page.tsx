"use client";

import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SearchBar } from "@/components/search/SearchBar";
import { RoomCard } from "@/components/ui/RoomCard";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import { ScheduleVisitButton } from "@/components/ui/ScheduleVisitButton";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ROOMS as STATIC_ROOMS, type RoomType } from "@/data/rooms";

export default function RoomsPage() {
    const [rooms, setRooms] = useState<RoomType[]>(STATIC_ROOMS);

    useEffect(() => {
        const ROOM_NAME_MAP: Record<string, string> = {
            "nexus-plus": "NEXUS",
            "collective-plus": "COLLECTIVE",
            "axis": "AXIS",
            "studio": "AXIS+",
        };
        const fetchRooms = async () => {
            try {
                const res = await apiFetch<{ data: { roomTypes: { name: string; basePrice?: number; discountedPrice?: number; pricing?: { original: number; discounted: number }; availableSeats: number }[] } }>("/api/public/rooms");
                if (res?.data?.roomTypes) {
                    const mapped = STATIC_ROOMS.map(staticRoom => {
                        const backendName = ROOM_NAME_MAP[staticRoom.id];
                        const beRoom = res.data.roomTypes.find(r => r.name === backendName);
                        if (beRoom) {
                            const origPrice = beRoom.pricing?.original ?? beRoom.basePrice ?? staticRoom.price;
                            const discPrice = beRoom.pricing?.discounted ?? beRoom.discountedPrice ?? staticRoom.price;
                            return {
                                ...staticRoom,
                                price: discPrice,
                                priceLabel: `₹${discPrice.toLocaleString()}`,
                                originalPrice: `₹${origPrice.toLocaleString()}`,
                                tag: beRoom.availableSeats > 0 ? staticRoom.tag : 'Sold Out',
                            };
                        }
                        return staticRoom;
                    });
                    setRooms(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
            }
        };
        fetchRooms();
    }, []);
    
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
                                { label: "Sq. Ft. (avg)", value: "550" },
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
                            {rooms.length} spaces available
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {rooms.map((room) => (
                            <RoomCard
                                key={`${room.title}-${room.type}`}
                                title={room.title}
                                type={room.type}
                                price={room.priceLabel || room.price.toString()}
                                originalPrice={room.originalPrice}
                                tag={room.tag}
                                amenities={room.amenities}
                                images={room.images}
                                featured={room.type === "4 Seater" || room.type === "3 Seater"}
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
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                            <EnquireNowButton variant="dark" label="Enquire Now" />
                            <ScheduleVisitButton variant="dark" />
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
