"use client";

import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/events-page.css";

const EVENTS = [
    {
        id: 1,
        title: "Founder's Fireside",
        date: "FEB 22",
        day: "22",
        month: "FEB",
        time: "7:00 PM",
        loc: "The Den, North Wing",
        type: "NETWORKING",
        desc: "An intimate evening with founders, investors, and builders. Share your story, hear theirs.",
        spots: 30,
    },
    {
        id: 2,
        title: "Yoga & Mindfulness",
        date: "FEB 25",
        day: "25",
        month: "FEB",
        time: "7:00 AM",
        loc: "Rooftop Garden",
        type: "WELLNESS",
        desc: "Start your week grounded. A guided session for all levels — no experience needed.",
        spots: 20,
    },
    {
        id: 3,
        title: "Career Workshop",
        date: "MAR 01",
        day: "01",
        month: "MAR",
        time: "6:00 PM",
        loc: "Thinking Room",
        type: "WORKSHOP",
        desc: "Resume reviews, mock interviews, and real feedback from industry professionals.",
        spots: 25,
    },
    {
        id: 4,
        title: "Sunday Community Brunch",
        date: "MAR 02",
        day: "02",
        month: "MAR",
        time: "11:00 AM",
        loc: "Community Kitchen",
        type: "SOCIAL",
        desc: "The weekly ritual. Good food, great people, zero agenda. Just show up.",
        spots: 60,
    },
    {
        id: 5,
        title: "Open Mic Night",
        date: "MAR 07",
        day: "07",
        month: "MAR",
        time: "8:00 PM",
        loc: "The Courtyard",
        type: "CULTURE",
        desc: "Poetry, music, stand-up, spoken word — the stage is yours. Audience always welcome.",
        spots: 80,
    },
    {
        id: 6,
        title: "Film Screening",
        date: "MAR 14",
        day: "14",
        month: "MAR",
        time: "9:00 PM",
        loc: "Rooftop Garden",
        type: "CULTURE",
        desc: "Curated cinema under the stars. This month: classic Indian parallel cinema.",
        spots: 50,
    },
];

const TYPE_COLORS: Record<string, string> = {
    NETWORKING: "#D8B56A",
    WELLNESS: "#7EC8A4",
    WORKSHOP: "#A78BFA",
    SOCIAL: "#F87171",
    CULTURE: "#60A5FA",
};

const FILTERS = ["ALL", "NETWORKING", "WELLNESS", "WORKSHOP", "SOCIAL", "CULTURE"];

export default function EventsPage() {
    const [activeFilter, setActiveFilter] = useState("ALL");

    const filtered = activeFilter === "ALL"
        ? EVENTS
        : EVENTS.filter(e => e.type === activeFilter);

    return (
        <main className="ev-page">
            <Navigation />

            {/* ── Hero ── */}
            <section className="ev-hero">
                <div className="ev-hero-grain" aria-hidden="true" />
                <div className="ev-hero-bg-text" aria-hidden="true">EVENTS</div>
                <div className="ev-hero-inner">
                    <p className="ev-eyebrow">Happenings at Viramah</p>
                    <h1 className="ev-hero-title">
                        Life beyond<br />
                        <span className="ev-gold">the classroom.</span>
                    </h1>
                    <p className="ev-hero-sub">
                        Weekly events, workshops, cultural nights, and community rituals.
                        Because the best memories aren't made in lecture halls.
                    </p>
                </div>
            </section>

            {/* ── Filter Bar ── */}
            <section className="ev-filter-section">
                <div className="ev-filter-inner">
                    <div className="ev-filters">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                className={`ev-filter-btn${activeFilter === f ? " ev-filter-active" : ""}`}
                                onClick={() => setActiveFilter(f)}
                                style={activeFilter === f && f !== "ALL" ? { borderColor: TYPE_COLORS[f], color: TYPE_COLORS[f] } : {}}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <p className="ev-count">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>
                </div>
            </section>

            {/* ── Events Grid ── */}
            <section className="ev-grid-section">
                <div className="ev-grid-inner">
                    <div className="ev-grid">
                        {filtered.map((evt) => (
                            <div key={evt.id} className="ev-card">
                                {/* Top row */}
                                <div className="ev-card-top">
                                    <span
                                        className="ev-type-badge"
                                        style={{ color: TYPE_COLORS[evt.type] || "#D8B56A", borderColor: `${TYPE_COLORS[evt.type]}40` || "rgba(216,181,106,0.25)" }}
                                    >
                                        {evt.type}
                                    </span>
                                    <div className="ev-date-badge">
                                        <span className="ev-date-day">{evt.day}</span>
                                        <span className="ev-date-month">{evt.month}</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="ev-card-title">{evt.title}</h3>
                                <p className="ev-card-desc">{evt.desc}</p>

                                {/* Meta */}
                                <div className="ev-card-meta">
                                    <div className="ev-meta-item">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                        {evt.time}
                                    </div>
                                    <div className="ev-meta-item">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {evt.loc}
                                    </div>
                                    <div className="ev-meta-item">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        {evt.spots} spots
                                    </div>
                                </div>

                                {/* CTA */}
                                <EnquireNowButton variant="dark" label="Enquire Now" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Monthly Ritual Strip ── */}
            <section className="ev-ritual">
                <div className="ev-ritual-grain" aria-hidden="true" />
                <div className="ev-ritual-inner">
                    <p className="ev-eyebrow">Every Sunday, 11 AM</p>
                    <h2 className="ev-ritual-title">The Community Brunch</h2>
                    <p className="ev-ritual-sub">
                        Our most beloved ritual. No agenda, no phones (well, mostly), just good food and real conversations.
                        Every resident is welcome. Every Sunday. No exceptions.
                    </p>
                    <EnquireNowButton variant="gold" label="Enquire Now" />
                </div>
            </section>

            <Footer />
        </main>
    );
}
