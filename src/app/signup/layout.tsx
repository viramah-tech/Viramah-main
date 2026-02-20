import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Join Viramah | Premium Student Living Registration",
    description: "Create your Viramah account and join the largest student living community in India. Secure your premium shared or private room today.",
    keywords: [
        "book premium hostel",
        "reserve hostel room online",
        "student accommodation booking",
        "secure hostel room now",
        "join viramah"
    ]
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
