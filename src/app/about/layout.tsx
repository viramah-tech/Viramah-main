import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Viramah | Reimagining Student Living in India",
    description: "Learn about the Viramah story. Born out of frustration with student housing, we built a sanctuary for the student mind. Experience intentional living, community vibes, and radical transparency.",
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
