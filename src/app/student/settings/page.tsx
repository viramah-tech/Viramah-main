"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, Home, ShieldCheck, LogOut, Key } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#F4F6F4] p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Account & Profile Settings"
                    subtitle="Manage resident profile information, contact details, and account security"
                    badge="SECURITY & PREFERENCES"
                />

                {/* Profile Information Card */}
                <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4">
                    <h3 className="font-serif text-xl font-bold text-[#1F3A2D] mb-4">Resident Profile</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                            <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-1">
                                Full Name
                            </span>
                            <span className="font-bold text-[#1F3A2D] text-sm">
                                {user?.basicInfo?.fullName || "Student Name"}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                            <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-1">
                                Resident User ID
                            </span>
                            <span className="font-bold text-[#1F3A2D] text-sm font-mono">
                                {user?.basicInfo?.userId || "N/A"}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                            <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-1">
                                Email Address
                            </span>
                            <span className="font-bold text-[#1F3A2D] text-sm">
                                {user?.basicInfo?.email || "student@viramah.com"}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                            <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-1">
                                Phone Number
                            </span>
                            <span className="font-bold text-[#1F3A2D] text-sm font-mono">
                                {user?.basicInfo?.phone || "+91 XXXXXXXXXX"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Account Security & Actions */}
                <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h4 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">Sign Out of Session</h4>
                        <p className="text-xs text-emerald-900/60 m-0 mt-0.5">Securely log out of the Viramah Student Portal</p>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 font-bold text-xs hover:bg-red-500/20 transition-all flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
