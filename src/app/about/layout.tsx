import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Viramah | Reimagining Student Living in India",
    description: "Learn about the Viramah story. Born out of frustration with student housing, we built a sanctuary for the student mind. Intentional living, community vibes, radical transparency.",
    openGraph: {
        title: "About Viramah | Reimagining Student Living in India",
        description: "Born out of frustration with student housing, Viramah is a sanctuary for the student mind — intentional living, community vibes, radical transparency.",
        url: "https://viramahstay.com/about",
    },
    keywords: [
        "hostel with dignity and comfort",
        "experience driven accommodation",
        "intentional living hostel",
        "hostel for ambitious youth",
        "safe and respectful hostel",
        "premium yet affordable hostel India",
        "hostel that feels like home"
    ]
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
