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
    User,
    Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

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
    { label: "Maintenance", href: "/student/maintenance", icon: Wrench },
    { label: "Settings", href: "/student/settings", icon: Settings },
];

interface PortalNavProps {
    role: "student" | "parent";
    userName?: string;
}

export function PortalNav({ role, userName = "Guest" }: PortalNavProps) {
    const pathname = usePathname();
    const navItems = role === "student" ? STUDENT_NAV : STUDENT_NAV;

    return (
        <aside style={{
            position: "fixed",
            left: 0,
            top: 0,
            height: "100vh",
            width: 272,
            background: "#fff",
            borderRight: "1px solid rgba(31,58,45,0.08)",
            display: "flex",
            flexDirection: "column",
            zIndex: 40,
            boxShadow: "4px 0 24px rgba(31,58,45,0.05)",
        }}>
            {/* Brand Header */}
            <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(31,58,45,0.07)" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                    <div style={{ width: 38, height: 38, flexShrink: 0 }}>
                        <img src="/logo.png" alt="Viramah Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                        <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.1rem", color: GREEN, display: "block", letterSpacing: "0.05em" }}>
                            VIRAMAH
                        </span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: GOLD, textTransform: "uppercase", letterSpacing: "0.25em" }}>
                            Student Portal
                        </span>
                    </div>
                </Link>
            </div>

            {/* User Info */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(31,58,45,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(31,58,45,0.04)" }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(31,58,45,0.15), rgba(31,58,45,0.08))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <User size={16} color={GREEN} />
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 600, color: GREEN, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {userName}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Resident
                        </span>
                    </div>
                    <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(31,58,45,0.3)", padding: "4px 8px 10px", margin: 0 }}>
                    Navigation
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        position: "relative",
                                        background: isActive ? GREEN : "transparent",
                                        transition: "background 0.2s ease",
                                        cursor: "pointer",
                                    }}
                                        className={!isActive ? "nav-item-hover" : ""}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                style={{ position: "absolute", inset: 0, background: GREEN, borderRadius: 10 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <item.icon
                                            size={17}
                                            color={isActive ? GOLD : "rgba(31,58,45,0.45)"}
                                            style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
                                        />
                                        <span style={{
                                            fontFamily: "var(--font-body, sans-serif)",
                                            fontSize: "0.85rem",
                                            fontWeight: isActive ? 600 : 500,
                                            color: isActive ? "#fff" : "rgba(31,58,45,0.7)",
                                            position: "relative",
                                            zIndex: 1,
                                            flex: 1,
                                        }}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <ChevronRight size={14} color="rgba(255,255,255,0.5)" style={{ position: "relative", zIndex: 1 }} />
                                        )}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div style={{ padding: "12px", borderTop: "1px solid rgba(31,58,45,0.07)" }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                    }}>
                        <LogOut size={16} color="rgba(31,58,45,0.4)" />
                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", color: "rgba(31,58,45,0.5)" }}>Sign Out</span>
                    </div>
                </Link>
            </div>

            <style>{`
                .nav-item-hover:hover {
                    background: rgba(31,58,45,0.05) !important;
                }
                .nav-item-hover:hover span {
                    color: #1F3A2D !important;
                }
                .nav-item-hover:hover svg {
                    color: #1F3A2D !important;
                }
            `}</style>
        </aside>
    );
}
