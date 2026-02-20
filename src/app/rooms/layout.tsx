import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Premium Hostel Rooms & Studios in Krishna Valley, Vrindavan | Viramah",
    description: "Book premium studios and shared rooms at Viramah. AC hostel rooms with high-speed WiFi, attached bathrooms, and private options. Best student accommodation in Vrindavan.",
    keywords: [
        "premium hostel near me",
        "hostel with attached bathroom",
        "private room hostel near me",
        "shared hostel room",
        "AC hostel near me",
        "student accommodation in Vrindavan",
        "book premium hostel online"
    ]
};

export default function RoomsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
