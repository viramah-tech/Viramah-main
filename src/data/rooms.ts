// ── Single source of truth for room data ─────────────────────
// Used by both /rooms page and /user-onboarding/step-3

export interface RoomType {
    id: string;
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
            "/room images/4 seater/room 1.webp",
            "/room images/4 seater/room 2.webp",
            "/room images/4 seater/study tables.webp",
            "/room images/4 seater/toilet.webp",
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
            "/room images/3 seater/room 1.png",
            "/room images/3 seater/room 2.png",
            "/room images/3 seater/study tables.webp",
            "/room images/3 seater/toilet.webp",
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
            "/room images/2 seater/bed + table.png",
            "/room images/2 seater/cuboard + beds.png",
            "/room images/2 seater/cuboard.png",
            "/room images/2 seater/toilet .png.jpeg",
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
            "/room images/1 seater/room side view.png",
            "/room images/1 seater/bed + table .png",
            "/room images/1 seater/cuboard.png",
            "/room images/1 seater/toilet.jpeg",
        ],
    },
];
