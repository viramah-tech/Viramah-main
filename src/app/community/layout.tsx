import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Viramah Community | Networking & Social Events for Students in India",
    description: "Join the largest student living community in India. Viramah offers weekly community dinners, peer mentorship, and networking opportunities for ambitious Gen Z students and creators.",
    keywords: [
        "community based hostel living",
        "gen z hostel lifestyle",
        "creative community hostel",
        "hostel with events and activities",
        "productive hostel environment",
        "networking opportunities for students",
        "loneliness free hostel"
    ]
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
