"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalNav } from "@/components/layout/PortalNav";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sand-light flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-terracotta-raw" />
                <span className="ml-3 font-body text-charcoal/60">Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-sand-light">
            {/* Sidebar Navigation */}
            <div
                className={`fixed top-0 left-0 h-full w-[280px] bg-white z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:block`}
            >
                <PortalNav role="student" userName={user?.fullName ?? "Student"} />
            </div>

            {/* Main Content Area */}
            <main className="lg:ml-[280px] min-h-screen">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-30 h-16 bg-sand-light/80 backdrop-blur-md border-b border-sand-dark/30 px-8 flex items-center justify-between">
                    <div className="font-mono text-xs text-charcoal/50 uppercase tracking-widest">
                        Student Dashboard
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] text-charcoal/40">
                            {new Date().toLocaleDateString("en-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })}
                        </span>
                        {/* Hamburger Button (mobile only) */}
                        <button
                            className="lg:hidden p-2 rounded-md border border-charcoal/20 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Overlay for sidebar (mobile) */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar overlay"
                    />
                )}

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
