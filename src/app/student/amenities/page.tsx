"use client";

import { useState } from "react";
import { Dumbbell, Sparkles, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const AMENITIES = [
    {
        id: "gym",
        title: "Fitness & Strength Gym",
        description: "Modern cardio equipment, weights, squat racks, and yoga mat area.",
        timing: "6:00 AM – 10:00 PM",
        icon: Dumbbell,
        slots: ["6:00 AM - 7:30 AM", "7:30 AM - 9:00 AM", "5:00 PM - 6:30 PM", "6:30 PM - 8:00 PM", "8:00 PM - 9:30 PM"],
    },
    {
        id: "laundry",
        title: "Automated Laundry Hub",
        description: "High-capacity washers & tumble dryers with automatic detergent dispensing.",
        timing: "7:00 AM – 11:00 PM",
        icon: Sparkles,
        slots: ["7:00 AM - 9:00 AM", "11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM", "7:00 PM - 9:00 PM"],
    },
    {
        id: "study",
        title: "Silent Study Pods",
        description: "Soundproof individual study booths equipped with high-speed LAN & power ports.",
        timing: "24/7 Access",
        icon: BookOpen,
        slots: ["Morning Slot (8:00 AM - 12:00 PM)", "Afternoon Slot (1:00 PM - 5:00 PM)", "Night Slot (8:00 PM - 12:00 AM)"],
    },
];

export default function AmenitiesPage() {
    const [bookedSlots, setBookedSlots] = useState<Record<string, string>>({});

    const handleBook = (amenityId: string, slot: string) => {
        setBookedSlots((prev) => ({ ...prev, [amenityId]: slot }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Amenities & Slot Booking"
                    subtitle="Reserve gym workouts, laundry washer slots, and quiet study pods"
                    badge="RESIDENT EXCLUSIVE"
                />

                <div className="space-y-6">
                    {AMENITIES.map((item) => {
                        const Icon = item.icon;
                        const activeSlot = bookedSlots[item.id];

                        return (
                            <div key={item.id} className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
                                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-emerald-800" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-xl font-bold text-[#1F3A2D] m-0">{item.title}</h3>
                                            <p className="text-xs text-emerald-900/60 m-0 mt-0.5">{item.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/5 text-xs text-emerald-900/60 font-mono">
                                        <Clock className="w-3.5 h-3.5" />
                                        {item.timing}
                                    </div>
                                </div>

                                <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                    Available Booking Slots for Today:
                                </span>

                                <div className="flex flex-wrap gap-2">
                                    {item.slots.map((slot) => {
                                        const isSelected = activeSlot === slot;
                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => handleBook(item.id, slot)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                                    isSelected ? "bg-[#1F3A2D] text-white border-[#1F3A2D]" : "bg-white text-emerald-900/70 border-emerald-900/15 hover:border-emerald-900/30"
                                                }`}
                                            >
                                                {slot}
                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D8B56A]" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {activeSlot && (
                                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-800 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Slot Reserved: {activeSlot}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
