import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Viramah Community | Networking & Social Events for Students in India",
    description: "Join Viramah's student living community. Weekly community dinners, peer mentorship, and networking for ambitious Gen Z students and creators in India.",
    openGraph: {
        title: "Viramah Community | Networking for Students",
        description: "Weekly dinners, peer mentorship, and networking for ambitious Gen Z students. Members, not tenants — join the Viramah community.",
        url: "https://viramahstay.com/community",
    },
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
