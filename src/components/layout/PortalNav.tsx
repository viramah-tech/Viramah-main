"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Wallet,
    UtensilsCrossed,
    Dumbbell,
    Settings,
    LogOut,
    ChevronRight,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const STUDENT_NAV: NavItem[] = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Wallet", href: "/student/wallet", icon: Wallet },
    { label: "Canteen", href: "/student/canteen", icon: UtensilsCrossed },
    { label: "Amenities", href: "/student/amenities", icon: Dumbbell },
    { label: "Settings", href: "/student/settings", icon: Settings },
];

const PARENT_NAV: NavItem[] = [
    { label: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
    { label: "Schedule Visit", href: "/parent/visit", icon: User },
    { label: "Settings", href: "/parent/settings", icon: Settings },
];

interface PortalNavProps {
    role: "student" | "parent";
    userName?: string;
}

export function PortalNav({ role, userName = "Guest" }: PortalNavProps) {
    const pathname = usePathname();
    const navItems = role === "student" ? STUDENT_NAV : PARENT_NAV;

    return (
        <aside className="fixed left-0 top-0 h-screen w-[280px] bg-ivory border-r border-sand-dark flex flex-col z-40">
            {/* Brand Header */}
            <div className="p-6 border-b border-sand-dark">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                        <img src="/logo.png" alt="Viramah Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <span className="font-display text-lg text-ink block">VIRAMAH</span>
                        <span className="font-mono text-[10px] text-gold uppercase tracking-widest">
                            {role === "student" ? "Student Portal" : "Parent Portal"}
                        </span>
                    </div>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-sand-dark/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-terracotta-soft/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-terracotta-raw" />
                    </div>
                    <div>
                        <span className="font-body text-sm font-medium text-charcoal block">{userName}</span>
                        <span className="font-mono text-[10px] text-charcoal/50 uppercase">
                            {role === "student" ? "Resident" : "Guardian"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-terracotta-raw text-white shadow-lg shadow-terracotta-raw/20"
                                            : "text-charcoal hover:bg-sand-dark/50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-terracotta-raw rounded-xl"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={cn(
                                        "w-5 h-5 relative z-10",
                                        isActive ? "text-white" : "text-charcoal/60 group-hover:text-charcoal"
                                    )} />
                                    <span className="font-body text-sm font-medium relative z-10">{item.label}</span>
                                    {isActive && (
                                        <ChevronRight className="w-4 h-4 ml-auto relative z-10" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-sand-dark">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal/60 hover:text-terracotta-raw hover:bg-sand-dark/30 transition-all duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-body text-sm">Sign Out</span>
                </Link>
            </div>
        </aside>
    );
}
