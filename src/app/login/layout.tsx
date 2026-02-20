import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Login | Viramah Member Portal",
    description: "Access your Viramah resident dashboard. Manage your stay, payments, and community events.",
    keywords: [
        "viramah login",
        "student hostel portal",
        "hostel management login",
        "parent friendly hostel portal"
    ]
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
