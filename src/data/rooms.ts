// ── Single source of truth for room data ─────────────────────
// Used by both /rooms page and /user-onboarding/step-3

export interface RoomType {
    id: string;
    backendId?: string;
    title: string;
    type: string;
    price: number;
    priceLabel: string;
    originalPrice: string;
    discount: string;
    tag: string;
    amenities: string[];
    images: string[];
    featured?: boolean;
}

export const ROOMS: RoomType[] = [
    {
        id: "nexus-plus",
        title: "VIRAMAH NEXUS+",
        type: "4 Seater",
        price: 9090,
        priceLabel: "₹9,090",
        originalPrice: "₹15,150",
        discount: "40% OFF",
        tag: "Limited",
        amenities: ["650 Sq Ft", "Shared Space", "High-Speed WiFi", "Study Desk", "Economy", "3 Meals", "2 Bean Bags"],
        images: [
            "/room images/4 seater/WhatsApp Image 2026-04-24 at 11.41.59 PM (2).jpeg",
            "/room images/4 seater/WhatsApp Image 2026-04-24 at 11.42.01 PM (2).jpeg",
            "/room images/4 seater/WhatsApp Image 2026-04-24 at 11.42.08 PM.jpeg",
            "/room images/4 seater/WhatsApp Image 2026-04-24 at 11.42.09 PM.jpeg",
        ],
        featured: true,
    },
    {
        id: "collective-plus",
        title: "VIRAMAH COLLECTIVE+",
        type: "3 Seater",
        price: 12490,
        priceLabel: "₹12,490",
        originalPrice: "₹20,817",
        discount: "40% OFF",
        tag: "Limited",
        amenities: ["650 Sq Ft", "Community Pick", "High-Speed WiFi", "Study Desk", "Kitchen", "3 Meals", "2 Bean Bags"],
        images: [
            "/room images/3 seater/WhatsApp Image 2026-04-24 at 11.41.59 PM (2).jpeg",
            "/room images/3 seater/WhatsApp Image 2026-04-24 at 11.42.01 PM (2).jpeg",
            "/room images/3 seater/WhatsApp Image 2026-04-24 at 11.42.08 PM.jpeg",
            "/room images/3 seater/WhatsApp Image 2026-04-24 at 11.42.09 PM.jpeg",
        ],
    },
    {
        id: "axis",
        title: "VIRAMAH AXIS",
        type: "2 Seater",
        price: 14490,
        priceLabel: "₹14,490",
        originalPrice: "₹24,150",
        discount: "40% OFF",
        tag: "Best Value",
        amenities: ["450 Sq Ft", "High-Speed WiFi", "Study Desk", "Essential Living", "3 Meals", "1 Bean Bag"],
        images: [
            "/room images/2 seater/WhatsApp Image 2026-04-24 at 11.42.12 PM.jpeg",
            "/room images/2 seater/WhatsApp Image 2026-04-24 at 11.42.15 PM.jpeg",
            "/room images/2 seater/WhatsApp Image 2026-04-24 at 11.42.18 PM.jpeg",
            "/room images/2 seater/WhatsApp Image 2026-04-24 at 11.42.22 PM.jpeg",
        ],
    },
    {
        id: "studio",
        title: "VIRAMAH STUDIO",
        type: "1 Seater",
        price: 16490,
        priceLabel: "₹16,490",
        originalPrice: "₹27,483",
        discount: "40% OFF",
        tag: "Limited",
        amenities: ["450 Sq Ft", "High-Speed WiFi", "Study Desk", "Essential Living", "3 Meals", "1 Bean Bag"],
        images: [
            "/room images/1 seater/WhatsApp Image 2026-04-24 at 11.42.12 PM.jpeg",
            "/room images/1 seater/WhatsApp Image 2026-04-24 at 11.42.15 PM.jpeg",
            "/room images/1 seater/WhatsApp Image 2026-04-24 at 11.42.18 PM.jpeg",
            "/room images/1 seater/WhatsApp Image 2026-04-24 at 11.42.22 PM.jpeg",
        ],
    },
];
