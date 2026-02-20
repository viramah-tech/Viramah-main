import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Viramah Events | Beyond the Classroom",
    description: "Explore weekly events, workshops, cultural nights, and community rituals at Viramah. Life at Viramah is more than just academics.",
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
