"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SearchBar } from "@/components/search/SearchBar";
import { RoomCard } from "@/components/ui/RoomCard";
import { useRooms } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

export default function RoomsPage() {
    const [filters, setFilters] = useState<{
        city?: string;
        type?: string;
        minPrice?: number;
        maxPrice?: number;
    }>({});

    const { data, isLoading, error } = useRooms(filters);

    const formatPrice = (price: number) => {
        return `₹${price.toLocaleString("en-IN")}`;
    };

    const getRoomTitle = (type: string, roomNumber: string) => {
        const typeNames: Record<string, string> = {
            "1-seater": "The Solo",
            "2-seater": "The Duo",
            "3-seater": "The Trio",
            "4-seater": "The Quad",
        };
        return typeNames[type] || roomNumber;
    };

    return (
        <main className="min-h-screen flex flex-col bg-sand-light">
            <Navigation />

            {/* Header */}
            <section className="pt-32 pb-12 bg-white">
                <Container>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta-raw">
                        Availability
                    </span>
                    <h1 className="font-display text-5xl md:text-6xl mt-4">GET YOUR SPACE</h1>
                </Container>
            </section>

            {/* Discovery Search Section */}
            <section className="relative z-20 -mt-10 pb-20">
                <Container>
                    <SearchBar />
                </Container>
            </section>

            {/* Results Grid */}
            <section className="py-0">
                <Container>
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-terracotta-raw" />
                            <span className="ml-3 font-body text-charcoal/60">Loading rooms...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-20">
                            <p className="font-body text-red-500">Failed to load rooms. Please try again.</p>
                        </div>
                    )}

                    {data && data.data.length === 0 && (
                        <div className="text-center py-20">
                            <p className="font-body text-charcoal/60">No rooms found matching your criteria.</p>
                        </div>
                    )}

                    {data && data.data.length > 0 && (
                        <>
                            <div className="mb-6">
                                <span className="font-mono text-xs text-charcoal/50 uppercase tracking-widest">
                                    {data.meta.total} rooms available
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data.data.map((room) => (
                                    <RoomCard
                                        key={room.id}
                                        title={getRoomTitle(room.type, room.roomNumber)}
                                        type={room.type.toUpperCase()}
                                        price={formatPrice(room.basePrice)}
                                        image={room.images?.[0] || "/placeholder-1.jpg"}
                                        href="/signup"
                                    />
                                ))}
                            </div>

                            {/* Pagination info */}
                            {data.meta.totalPages > 1 && (
                                <div className="flex justify-center mt-12">
                                    <span className="font-mono text-xs text-charcoal/50">
                                        Page {data.meta.page} of {data.meta.totalPages}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </section>

            <Footer />
        </main>
    );
}
