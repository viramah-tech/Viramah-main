import { PortalNav } from "@/components/layout/PortalNav";
import { mockUser } from "@/lib/auth";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-sand-light">
            {/* Sidebar Navigation */}
            <PortalNav role="student" userName={mockUser.name} />

            {/* Main Content Area */}
            <main className="ml-[280px] min-h-screen">
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
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
