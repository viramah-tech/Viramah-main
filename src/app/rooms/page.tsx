import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { FilterBar } from "@/components/search/FilterBar";
import { RoomCard } from "@/components/ui/RoomCard";

export default function RoomsPage() {
    return (
        <main className="min-h-screen flex flex-col bg-sand-light">
            <Navigation />

            {/* Header */}
            <section className="pt-32 pb-12 bg-white">
                <Container>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta-raw">
                        Availability
                    </span>
                    <h1 className="font-display text-5xl md:text-6xl mt-4">Find Your Sanctuary</h1>
                </Container>
            </section>

            <FilterBar />

            {/* Results Grid */}
            <section className="py-12">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <RoomCard
                            title="The Solo"
                            type="1 SEATER"
                            price="₹25,000"
                            image="/placeholder-1.jpg"
                        />
                        <RoomCard
                            title="The Duo"
                            type="2 SEATER"
                            price="₹18,000"
                            image="/placeholder-2.jpg"
                        />
                        <RoomCard
                            title="The Tribe"
                            type="3 SEATER"
                            price="₹15,000"
                            image="/placeholder-3.jpg"
                        />
                        {/* Duplicates for demo */}
                        <RoomCard
                            title="The Solo Plus"
                            type="1 SEATER"
                            price="₹28,000"
                            image="/placeholder-4.jpg"
                        />
                        <RoomCard
                            title="The Duo Deluxe"
                            type="2 SEATER"
                            price="₹22,000"
                            image="/placeholder-5.jpg"
                        />
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
