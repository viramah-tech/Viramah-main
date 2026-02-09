"use client";

import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Calendar, List, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENTS = [
    { id: 1, title: "Founder's Fireside", date: "FEB 12", time: "7:00 PM", loc: "The Den, North Campus", type: "NETWORKING" },
    { id: 2, title: "Yoga & Mindfulness", date: "FEB 14", time: "8:00 AM", loc: "Rooftop Garden", type: "WELLNESS" },
    { id: 3, title: "Career Workshop", date: "FEB 18", time: "6:00 PM", loc: "Thinking Room", type: "WORKSHOP" },
    { id: 4, title: "Sunday Brunch", date: "FEB 23", time: "11:00 AM", loc: "Community Kitchen", type: "SOCIAL" },
];

export default function EventsPage() {
    const [view, setView] = useState<"grid" | "list">("grid");

    return (
        <main className="min-h-screen flex flex-col bg-sand-light">
            <Navigation />

            <section className="pt-40 pb-12">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-terracotta-raw">
                                Happenings
                            </span>
                            <h1 className="font-display text-5xl md:text-6xl mt-4">Curated Events</h1>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-sand-dark">
                            <button
                                onClick={() => setView("grid")}
                                className={cn("p-2 rounded-md transition-colors", view === "grid" ? "bg-sand-dark/20 text-charcoal" : "text-charcoal/50")}
                            >
                                <Calendar className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setView("list")}
                                className={cn("p-2 rounded-md transition-colors", view === "list" ? "bg-sand-dark/20 text-charcoal" : "text-charcoal/50")}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-12">
                <Container>
                    <div className={cn("grid gap-6", view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                        {EVENTS.map((evt) => (
                            <div key={evt.id} className="bg-white p-6 rounded-2xl border border-transparent hover:border-terracotta-raw/20 hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="font-mono text-xs bg-sand-dark/30 px-2 py-1 rounded text-charcoal/60 group-hover:bg-terracotta-raw group-hover:text-white transition-colors">
                                        {evt.type}
                                    </span>
                                    <div className="text-center bg-sand-light p-2 rounded-lg min-w-[60px]">
                                        <span className="block font-bold text-terracotta-raw leading-none">{evt.date.split(" ")[1]}</span>
                                        <span className="block text-[10px] font-mono leading-none mt-1">{evt.date.split(" ")[0]}</span>
                                    </div>
                                </div>

                                <h3 className="font-display text-2xl mb-2 group-hover:text-terracotta-raw transition-colors">{evt.title}</h3>

                                <div className="flex flex-col gap-2 mt-4 text-sm opacity-60">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {evt.time}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {evt.loc}
                                    </div>
                                </div>

                                <Button variant="secondary" className="w-full mt-6 group-hover:bg-terracotta-soft/20 group-hover:border-transparent">
                                    RSVP
                                </Button>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
