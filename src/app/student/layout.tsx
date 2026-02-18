"use client";
import { useState } from "react";
import { PortalNav } from "@/components/layout/PortalNav";
import { mockUser } from "@/lib/auth";
import { Bell, Menu, X } from "lucide-react";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ minHeight: "100vh", background: "#F6F4EF", display: "flex" }}>
            {/* Sidebar — desktop always visible */}
            <div style={{ display: "none" }} className="lg-sidebar-placeholder" />
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    width: 272,
                    zIndex: 40,
                    transform: sidebarOpen ? "translateX(0)" : undefined,
                }}
                className={`sidebar-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}
            >
                <PortalNav role="student" userName={mockUser.name} />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(10,20,15,0.45)",
                        backdropFilter: "blur(4px)",
                        zIndex: 39,
                    }}
                />
            )}

            {/* Main content */}
            <main style={{ flex: 1, marginLeft: 272, minHeight: "100vh", display: "flex", flexDirection: "column" }} className="main-content">
                {/* Top Header */}
                <header style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 30,
                    height: 60,
                    background: "rgba(246,244,239,0.92)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(31,58,45,0.08)",
                    padding: "0 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 16px rgba(31,58,45,0.05)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="mobile-menu-btn"
                            style={{
                                display: "none",
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                border: "1px solid rgba(31,58,45,0.12)",
                                background: "#fff",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? <X size={18} color={GREEN} /> : <Menu size={18} color={GREEN} />}
                        </button>
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.6rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.25em",
                            color: "rgba(31,58,45,0.4)",
                        }}>
                            Student Portal
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Date */}
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.6rem",
                            color: "rgba(31,58,45,0.35)",
                            letterSpacing: "0.05em",
                        }}>
                            {new Date().toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>

                        {/* Notification bell */}
                        <div style={{ position: "relative" }}>
                            <button style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                border: "1px solid rgba(31,58,45,0.1)",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 1px 4px rgba(31,58,45,0.06)",
                            }}>
                                <Bell size={16} color={GREEN} />
                            </button>
                            <div style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: GOLD,
                                border: "1.5px solid #F6F4EF",
                            }} />
                        </div>

                        {/* Avatar */}
                        <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #1F3A2D, #2a4d3a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `2px solid ${GOLD}`,
                        }}>
                            <span style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontSize: "0.65rem",
                                color: GOLD,
                                fontWeight: 700,
                            }}>
                                {mockUser.name.charAt(0)}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "32px 28px 60px" }}>
                    {children}
                </div>
            </main>

            <style>{`
                @media (max-width: 1023px) {
                    .main-content {
                        margin-left: 0 !important;
                    }
                    .sidebar-wrapper {
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    .sidebar-wrapper.sidebar-open {
                        transform: translateX(0) !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
}
