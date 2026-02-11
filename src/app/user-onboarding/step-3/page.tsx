"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
    ArrowRight, ArrowLeft, Home, Wifi, Wind, Bath, Check, UtensilsCrossed,
    Search, X, ArrowUpDown, SlidersHorizontal, Bed, Square, Compass, Zap,
    Users, Star, ChevronRight, Loader2
} from "lucide-react";
import { saveRoomSelection } from "../actions";

// Room types
interface Room {
    id: string;
    number: string;
    floor: number;
    type: "single" | "double" | "triple";
    price: number;
    securityDeposit: number;
    available: boolean;
    amenities: string[];
    size: number;
    facing: string;
    furniture: string[];
    image: string;
}

// Mock room data with images
const MOCK_ROOMS: Room[] = [
    { id: "101", number: "101", floor: 1, type: "single", price: 8000, securityDeposit: 16000, available: true, amenities: ["wifi", "ac", "attached_bath", "power_backup"], size: 120, facing: "East", furniture: ["Single Bed", "Wardrobe", "Study Desk", "Chair"], image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop" },
    { id: "102", number: "102", floor: 1, type: "double", price: 6500, securityDeposit: 13000, available: true, amenities: ["wifi", "ac"], size: 180, facing: "North", furniture: ["2 Single Beds", "Wardrobe", "Study Table"], image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop" },
    { id: "103", number: "103", floor: 1, type: "double", price: 6500, securityDeposit: 13000, available: false, amenities: ["wifi", "ac", "attached_bath"], size: 180, facing: "West", furniture: ["2 Single Beds", "Wardrobe", "2 Chairs"], image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" },
    { id: "104", number: "104", floor: 1, type: "triple", price: 5000, securityDeposit: 10000, available: true, amenities: ["wifi"], size: 220, facing: "South", furniture: ["3 Single Beds", "Wardrobe"], image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=300&fit=crop" },
    { id: "201", number: "201", floor: 2, type: "single", price: 8500, securityDeposit: 17000, available: true, amenities: ["wifi", "ac", "attached_bath", "power_backup"], size: 130, facing: "East", furniture: ["Single Bed", "Wardrobe", "Study Desk", "Chair", "Bookshelf"], image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop" },
    { id: "202", number: "202", floor: 2, type: "triple", price: 5500, securityDeposit: 11000, available: true, amenities: ["wifi", "ac"], size: 250, facing: "North", furniture: ["3 Single Beds", "2 Wardrobes", "Study Table"], image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400&h=300&fit=crop" },
    { id: "203", number: "203", floor: 2, type: "double", price: 7000, securityDeposit: 14000, available: true, amenities: ["wifi", "ac", "attached_bath"], size: 200, facing: "West", furniture: ["2 Single Beds", "Wardrobe", "Study Desk", "2 Chairs"], image: "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=400&h=300&fit=crop" },
    { id: "301", number: "301", floor: 3, type: "single", price: 9000, securityDeposit: 18000, available: true, amenities: ["wifi", "ac", "attached_bath", "power_backup"], size: 140, facing: "East", furniture: ["Single Bed", "Wardrobe", "Study Desk", "Chair", "Bookshelf"], image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop" },
    { id: "302", number: "302", floor: 3, type: "double", price: 7500, securityDeposit: 15000, available: false, amenities: ["wifi", "ac", "attached_bath", "power_backup"], size: 210, facing: "South", furniture: ["2 Single Beds", "Wardrobe", "Study Desk", "2 Chairs"], image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop" },
];

const MESS_PACKAGES = [
    { id: "full", name: "Full Board", price: 4500, description: "Breakfast + Dinner + Lunch box delivery", features: ["All meals included", "Lunch box delivery", "Weekend specials"], includesLunchDelivery: true },
    { id: "partial", name: "Partial Board", price: 3000, description: "Breakfast + Dinner only", features: ["Morning & evening meals", "No lunch delivery", "Weekend specials"], includesLunchDelivery: false },
];

const AMENITY_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
    wifi: { icon: Wifi, label: "WiFi" },
    ac: { icon: Wind, label: "AC" },
    attached_bath: { icon: Bath, label: "Attached Bath" },
    power_backup: { icon: Zap, label: "Power Backup" },
};

const PRICE_RANGES = [
    { id: "all", label: "All Prices", min: 0, max: Infinity },
    { id: "budget", label: "Under ₹6,000", min: 0, max: 6000 },
    { id: "mid", label: "₹6,000 - ₹8,000", min: 6000, max: 8000 },
    { id: "premium", label: "Above ₹8,000", min: 8000, max: Infinity },
];

const SORT_OPTIONS = [
    { id: "price_low", label: "Price: Low to High" },
    { id: "price_high", label: "Price: High to Low" },
    { id: "room_number", label: "Room Number" },
    { id: "floor", label: "Floor" },
];

// Premium Room Card Component
function RoomCard({ room, isSelected, onSelect, onViewDetails }: {
    room: Room;
    isSelected: boolean;
    onSelect: () => void;
    onViewDetails: () => void;
}) {
    const typeLabels = { single: "Single", double: "Double Sharing", triple: "Triple Sharing" };
    const typeColors = { single: "terracotta-raw", double: "gold", triple: "sage-muted" };
    const occupancyCount = { single: 1, double: 2, triple: 3 };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group relative bg-ivory rounded-xl overflow-hidden transition-all duration-300 ${isSelected
                ? "ring-2 ring-terracotta-raw shadow-xl shadow-terracotta-raw/15"
                : room.available
                    ? "shadow-lg shadow-charcoal/5 hover:shadow-xl hover:shadow-charcoal/10"
                    : "opacity-60 grayscale-[30%]"
                }`}
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={room.image}
                    alt={`Room ${room.number}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div className={`px-3 py-1.5 rounded-full bg-${typeColors[room.type]} text-white font-mono text-[10px] uppercase tracking-wider shadow-lg`}
                        style={{ backgroundColor: room.type === 'single' ? 'var(--terracotta-raw)' : room.type === 'double' ? 'var(--gold)' : 'var(--sage-muted)' }}>
                        {typeLabels[room.type]}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider shadow-lg ${room.available
                        ? "bg-white/95 text-sage-muted"
                        : "bg-terracotta-raw text-white"
                        }`}>
                        {room.available ? "● Available" : "● Occupied"}
                    </div>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-terracotta-raw shadow-lg flex items-center justify-center"
                    >
                        <Check className="w-5 h-5 text-white" />
                    </motion.div>
                )}

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="font-display text-2xl text-white drop-shadow-lg">Room {room.number}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[10px] text-white/80">Floor {room.floor}</span>
                                <span className="w-1 h-1 rounded-full bg-white/50" />
                                <span className="font-mono text-[10px] text-white/80">{room.facing}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-display text-2xl text-white drop-shadow-lg">₹{room.price.toLocaleString()}</span>
                            <span className="font-mono text-[10px] text-white/70 block">/month</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-4">
                {/* Quick Stats */}
                <div className="flex items-center gap-4 pb-4 border-b border-sand-dark/30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sand-light flex items-center justify-center">
                            <Square className="w-4 h-4 text-charcoal/50" />
                        </div>
                        <div>
                            <span className="font-mono text-[10px] text-charcoal/50 block">SIZE</span>
                            <span className="font-body text-sm text-charcoal font-medium">{room.size} sq.ft</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sand-light flex items-center justify-center">
                            <Users className="w-4 h-4 text-charcoal/50" />
                        </div>
                        <div>
                            <span className="font-mono text-[10px] text-charcoal/50 block">OCCUPANCY</span>
                            <span className="font-body text-sm text-charcoal font-medium">{occupancyCount[room.type]} {occupancyCount[room.type] === 1 ? 'Person' : 'Persons'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sand-light flex items-center justify-center">
                            <Compass className="w-4 h-4 text-charcoal/50" />
                        </div>
                        <div>
                            <span className="font-mono text-[10px] text-charcoal/50 block">FACING</span>
                            <span className="font-body text-sm text-charcoal font-medium">{room.facing}</span>
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 4).map((amenity) => {
                        const amenityData = AMENITY_ICONS[amenity];
                        if (!amenityData) return null;
                        const Icon = amenityData.icon;
                        return (
                            <div key={amenity} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sand-light/80 border border-sand-dark/20">
                                <Icon className="w-3.5 h-3.5 text-terracotta-raw/70" />
                                <span className="font-mono text-[10px] text-charcoal/70">{amenityData.label}</span>
                            </div>
                        );
                    })}
                    {room.amenities.length > 4 && (
                        <span className="px-2.5 py-1.5 rounded-lg bg-terracotta-raw/10 font-mono text-[10px] text-terracotta-raw">
                            +{room.amenities.length - 4} more
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onViewDetails}
                        className="flex-1 py-3 rounded-xl border border-charcoal/20 font-mono text-xs text-charcoal/70 hover:border-charcoal/40 hover:bg-sand-light/50 transition-all flex items-center justify-center gap-2"
                    >
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => room.available && onSelect()}
                        disabled={!room.available}
                        className={`flex-1 py-3 rounded-xl font-mono text-xs transition-all flex items-center justify-center gap-2 ${!room.available
                            ? "bg-sand-dark/30 text-charcoal/30 cursor-not-allowed"
                            : isSelected
                                ? "bg-terracotta-raw text-white shadow-lg shadow-terracotta-raw/25"
                                : "bg-charcoal text-ivory hover:bg-terracotta-raw hover:shadow-lg hover:shadow-terracotta-raw/25"
                            }`}
                    >
                        {isSelected ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                Selected
                            </>
                        ) : room.available ? (
                            "Select Room"
                        ) : (
                            "Occupied"
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Room Detail Modal
function RoomDetailModal({ room, onClose, onSelect, isSelected }: {
    room: Room; onClose: () => void; onSelect: () => void; isSelected: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-ivory rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Image */}
                <div className="relative h-64">
                    <img src={room.image} alt={`Room ${room.number}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <X className="w-5 h-5 text-charcoal" />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div>
                            <h2 className="font-display text-3xl text-white">Room {room.number}</h2>
                            <p className="font-mono text-sm text-white/80">Floor {room.floor} • {room.size} sq.ft • {room.facing} facing</p>
                        </div>
                        <div className="text-right">
                            <span className="font-display text-3xl text-white">₹{room.price.toLocaleString()}</span>
                            <span className="font-mono text-xs text-white/70 block">/month</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Amenities */}
                    <div>
                        <h3 className="font-body font-medium text-charcoal mb-3">Amenities</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {room.amenities.map((amenity) => {
                                const amenityData = AMENITY_ICONS[amenity];
                                if (!amenityData) return null;
                                const Icon = amenityData.icon;
                                return (
                                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-xl bg-sand-light/50 border border-sand-dark/20">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                            <Icon className="w-5 h-5 text-terracotta-raw" />
                                        </div>
                                        <span className="font-body text-sm text-charcoal">{amenityData.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Furniture */}
                    <div>
                        <h3 className="font-body font-medium text-charcoal mb-3">Furniture Included</h3>
                        <div className="flex flex-wrap gap-2">
                            {room.furniture.map((item) => (
                                <span key={item} className="px-4 py-2 rounded-full bg-gold/15 border border-gold/30 font-mono text-xs text-charcoal">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Security Deposit */}
                    <div className="p-4 rounded-xl bg-sand-light/50 border border-sand-dark/20">
                        <div className="flex justify-between items-center">
                            <span className="font-body text-charcoal/70">Security Deposit</span>
                            <span className="font-display text-xl text-charcoal">₹{room.securityDeposit.toLocaleString()}</span>
                        </div>
                        <span className="font-mono text-[10px] text-charcoal/50">Refundable • Equal to 2 months rent</span>
                    </div>

                    {/* Action */}
                    <button
                        onClick={() => { onSelect(); onClose(); }}
                        disabled={!room.available}
                        className={`w-full py-4 rounded-xl font-body font-medium transition-all ${!room.available ? "bg-sand-dark/50 text-charcoal/40 cursor-not-allowed" :
                            isSelected ? "bg-sage-muted text-white" : "bg-terracotta-raw text-white hover:bg-terracotta-raw/90 shadow-lg shadow-terracotta-raw/25"
                            }`}
                    >
                        {isSelected ? "✓ Room Selected" : room.available ? "Select This Room" : "Room Occupied"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Mess Package Card
function MessPackageCard({ pkg, isSelected, onSelect }: { pkg: typeof MESS_PACKAGES[0]; isSelected: boolean; onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className={`flex-1 p-5 rounded-xl border-2 text-left transition-all ${isSelected ? "border-gold bg-gold/10 shadow-lg shadow-gold/10" : "border-sand-dark hover:border-gold/50"
                }`}
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-gold" : "bg-sand-light"}`}>
                    <UtensilsCrossed className={`w-5 h-5 ${isSelected ? "text-white" : "text-charcoal/40"}`} />
                </div>
                <div className="flex-1">
                    <span className={`font-body font-medium block ${isSelected ? "text-gold" : "text-charcoal"}`}>{pkg.name}</span>
                    <span className="font-display text-xl text-terracotta-raw">₹{pkg.price.toLocaleString()}<span className="font-mono text-xs text-charcoal/50">/mo</span></span>
                </div>
                {pkg.includesLunchDelivery && (
                    <span className="px-2 py-1 rounded bg-sage-muted/20 font-mono text-[9px] text-sage-muted uppercase">Lunch Delivery</span>
                )}
            </div>
            <p className="font-mono text-[11px] text-charcoal/60 mb-3">{pkg.description}</p>
            <div className="space-y-1.5">
                {pkg.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                        <Check className={`w-3 h-3 ${isSelected ? "text-gold" : "text-charcoal/30"}`} />
                        <span className="font-mono text-[10px] text-charcoal/60">{feature}</span>
                    </div>
                ))}
            </div>
        </button>
    );
}

export default function Step3Page() {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<string>("full");
    const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ type: "all", floor: "all", priceRange: "all", showAvailable: true });
    const [sortBy, setSortBy] = useState("room_number");
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredRooms = useMemo(() => {
        let result = MOCK_ROOMS.filter((room) => {
            if (searchQuery && !room.number.includes(searchQuery)) return false;
            if (filters.showAvailable && !room.available) return false;
            if (filters.type !== "all" && room.type !== filters.type) return false;
            if (filters.floor !== "all" && room.floor !== parseInt(filters.floor)) return false;
            const priceRange = PRICE_RANGES.find(p => p.id === filters.priceRange);
            if (priceRange && (room.price < priceRange.min || room.price > priceRange.max)) return false;
            return true;
        });
        result.sort((a, b) => {
            switch (sortBy) {
                case "price_low": return a.price - b.price;
                case "price_high": return b.price - a.price;
                case "floor": return a.floor - b.floor;
                default: return a.number.localeCompare(b.number);
            }
        });
        return result;
    }, [searchQuery, filters, sortBy]);

    const activeFilterTags = useMemo(() => {
        const tags: { label: string; reset: () => void }[] = [];
        if (filters.type !== "all") tags.push({ label: filters.type, reset: () => setFilters(f => ({ ...f, type: "all" })) });
        if (filters.floor !== "all") tags.push({ label: `Floor ${filters.floor}`, reset: () => setFilters(f => ({ ...f, floor: "all" })) });
        if (filters.priceRange !== "all") {
            const range = PRICE_RANGES.find(p => p.id === filters.priceRange);
            if (range) tags.push({ label: range.label, reset: () => setFilters(f => ({ ...f, priceRange: "all" })) });
        }
        return tags;
    }, [filters]);

    const selectedMessPackage = MESS_PACKAGES.find((p) => p.id === selectedPackage);
    const totalMonthly = selectedRoom && selectedMessPackage ? selectedRoom.price + selectedMessPackage.price : 0;
    const floors = [...new Set(MOCK_ROOMS.map(r => r.floor))].sort();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-raw/10 mb-4">
                    <Home className="w-4 h-4 text-terracotta-raw" />
                    <span className="font-mono text-xs text-terracotta-raw uppercase tracking-widest">Room Selection</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-3">Choose your room</h1>
                <p className="font-body text-charcoal/60 max-w-lg mx-auto">Browse available rooms and select one that fits your preferences.</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-ivory rounded-2xl border border-sand-dark/50 p-4 shadow-sm space-y-4">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
                        <input
                            type="text"
                            placeholder="Search by room number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-dark bg-white font-mono text-sm placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta-raw"
                        />
                    </div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-xl border border-sand-dark bg-white font-mono text-xs cursor-pointer focus:outline-none focus:border-terracotta-raw">
                        {SORT_OPTIONS.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
                    </select>
                    <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all ${showFilters ? "border-terracotta-raw bg-terracotta-raw/10 text-terracotta-raw" : "border-sand-dark text-charcoal/60 hover:border-charcoal/30"}`}>
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-sand-dark/30">
                                <div><label className="font-mono text-[10px] text-charcoal/50 uppercase block mb-2">Room Type</label><select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-sand-dark font-mono text-xs focus:outline-none focus:border-terracotta-raw"><option value="all">All Types</option><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option></select></div>
                                <div><label className="font-mono text-[10px] text-charcoal/50 uppercase block mb-2">Floor</label><select value={filters.floor} onChange={(e) => setFilters({ ...filters, floor: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-sand-dark font-mono text-xs focus:outline-none focus:border-terracotta-raw"><option value="all">All Floors</option>{floors.map((f) => (<option key={f} value={f}>Floor {f}</option>))}</select></div>
                                <div><label className="font-mono text-[10px] text-charcoal/50 uppercase block mb-2">Price Range</label><select value={filters.priceRange} onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-sand-dark font-mono text-xs focus:outline-none focus:border-terracotta-raw">{PRICE_RANGES.map((range) => (<option key={range.id} value={range.id}>{range.label}</option>))}</select></div>
                                <div><label className="font-mono text-[10px] text-charcoal/50 uppercase block mb-2">Availability</label><label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-sand-dark hover:bg-sand-light/50"><input type="checkbox" checked={filters.showAvailable} onChange={(e) => setFilters({ ...filters, showAvailable: e.target.checked })} className="w-4 h-4 rounded border-sand-dark text-terracotta-raw focus:ring-terracotta-raw" /><span className="font-mono text-xs text-charcoal/60">Available only</span></label></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        {activeFilterTags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-terracotta-raw/10 text-terracotta-raw font-mono text-xs">
                                {tag.label}<button onClick={tag.reset} className="hover:bg-terracotta-raw/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                        {activeFilterTags.length > 0 && (<button onClick={() => setFilters({ type: "all", floor: "all", priceRange: "all", showAvailable: true })} className="font-mono text-[10px] text-terracotta-raw hover:underline">Clear all</button>)}
                    </div>
                    <span className="font-mono text-xs text-charcoal/50">{filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""} found</span>
                </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} isSelected={selectedRoom?.id === room.id} onSelect={() => setSelectedRoom(room)} onViewDetails={() => setViewingRoom(room)} />
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <div className="text-center py-16 bg-ivory rounded-2xl border border-sand-dark/50">
                    <Home className="w-16 h-16 text-charcoal/10 mx-auto mb-4" />
                    <p className="font-body text-charcoal/60 mb-2">No rooms match your filters</p>
                    <button onClick={() => setFilters({ type: "all", floor: "all", priceRange: "all", showAvailable: true })} className="font-mono text-xs text-terracotta-raw hover:underline">Reset filters</button>
                </div>
            )}

            {/* Mess Package */}
            {selectedRoom && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-ivory rounded-2xl border border-sand-dark/50 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center"><UtensilsCrossed className="w-5 h-5 text-gold" /></div>
                        <div><span className="font-body font-medium text-charcoal block">Select Mess Package</span><span className="font-mono text-[10px] text-charcoal/50">Choose your meal plan</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{MESS_PACKAGES.map((pkg) => (<MessPackageCard key={pkg.id} pkg={pkg} isSelected={selectedPackage === pkg.id} onSelect={() => setSelectedPackage(pkg.id)} />))}</div>
                </motion.div>
            )}

            {/* Summary */}
            {selectedRoom && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <span className="font-display text-xl">Your Selection</span>
                        <button onClick={() => setSelectedRoom(null)} className="font-mono text-xs opacity-60 hover:opacity-100 hover:underline">Change room</button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
                        <div className="flex justify-between font-mono text-sm"><span className="opacity-60">Room</span><span>{selectedRoom.number} ({selectedRoom.type})</span></div>
                        <div className="flex justify-between font-mono text-sm"><span className="opacity-60">{selectedMessPackage?.name}</span><span>₹{selectedMessPackage?.price.toLocaleString()}/mo</span></div>
                        <div className="flex justify-between font-mono text-sm"><span className="opacity-60">Room Rent</span><span>₹{selectedRoom.price.toLocaleString()}/mo</span></div>
                        <div className="flex justify-between font-mono text-sm"><span className="opacity-60">Security Deposit</span><span className="text-gold">₹{selectedRoom.securityDeposit.toLocaleString()}</span></div>
                    </div>
                    <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                        <span className="font-body font-medium">Total Monthly</span>
                        <span className="font-display text-3xl text-gold">₹{totalMonthly.toLocaleString()}</span>
                    </div>
                </motion.div>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="font-body text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Link href="/user-onboarding/step-2"><Button variant="secondary" size="lg" className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
                <Button
                    size="lg"
                    className="gap-2"
                    disabled={!selectedRoom || isLoading}
                    onClick={async () => {
                        if (!selectedRoom) return;
                        setIsLoading(true);
                        setError(null);
                        try {
                            const fd = new FormData();
                            fd.append('roomId', selectedRoom.id);
                            const pkg = MESS_PACKAGES.find(p => p.id === selectedPackage);
                            if (pkg) fd.append('messPackageId', pkg.id);
                            fd.append('totalAmount', String(totalMonthly));
                            const result = await saveRoomSelection(fd);
                            if (result?.error) setError(result.error);
                        } catch {
                            // redirect() throws, expected
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                    ) : (
                        <>Continue to Preferences<ArrowRight className="w-4 h-4" /></>
                    )}
                </Button>
            </div>

            {/* Modal */}
            <AnimatePresence>{viewingRoom && (<RoomDetailModal room={viewingRoom} onClose={() => setViewingRoom(null)} onSelect={() => setSelectedRoom(viewingRoom)} isSelected={selectedRoom?.id === viewingRoom.id} />)}</AnimatePresence>
        </motion.div>
    );
}
