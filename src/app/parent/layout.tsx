import { PortalNav } from "@/components/layout/PortalNav";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ParentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session.isAuthenticated || !session.user) {
        redirect("/login");
    }

    return (
        <AuthProvider user={session.user}>
            <div className="min-h-screen bg-sand-light">
                {/* Sidebar Navigation */}
                <PortalNav role="parent" userName={session.user.name} />

                {/* Main Content Area */}
                <main className="ml-[280px] min-h-screen">
                    {/* Top Header Bar */}
                    <header className="sticky top-0 z-30 h-16 bg-sand-light/80 backdrop-blur-md border-b border-sand-dark/30 px-8 flex items-center justify-between">
                        <div className="font-mono text-xs text-charcoal/50 uppercase tracking-widest">
                            Parent Portal
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
        </AuthProvider>
    );
}
