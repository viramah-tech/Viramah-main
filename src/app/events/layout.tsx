import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Viramah Events | Workshops, Cultural Nights & Student Activities",
    description: "Explore weekly events, workshops, cultural nights, and community rituals at Viramah. Life at Viramah is more than just academics.",
    openGraph: {
        title: "Viramah Events | Workshops, Cultural Nights & Student Activities",
        description: "Weekly events, workshops, cultural nights, and community rituals. Life at Viramah goes beyond the classroom.",
        url: "https://viramahstay.com/events",
    },
    keywords: [
        "hostel events and activities",
        "student networking events",
        "cultural nights in hostel",
        "student wellness workshops",
        "community brunch",
        "networking for creators",
        "life at viramah"
    ]
};

export default function EventsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
