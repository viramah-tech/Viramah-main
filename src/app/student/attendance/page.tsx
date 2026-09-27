"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
    Fingerprint,
    CheckCircle2,
    Clock,
    CreditCard,
    ArrowDownLeft,
    ArrowUpRight,
    ShieldAlert,
    AlertCircle,
    Calendar,
    RefreshCw,
    Info,
    DoorClosed,
    DoorOpen
} from "lucide-react";

interface PunchLog {
    id: string;
    punchTime: string;
    timeStr: string;
    dateStr: string;
    inOut: "IN" | "OUT" | string;
    source: string;
    deviceSerial: string;
    status: string;
    notes?: string;
}

interface StudentAttendanceResponse {
    student: {
        userId: string;
        fullName: string;
        email: string;
        phone: string;
        biometricCardNo?: string;
        roomDetails?: { roomNumber?: string };
    };
    stats: {
        totalPunches: number;
        daysPresent: number;
        cardNo: string;
    };
    logs: PunchLog[];
}

export default function StudentAttendancePage() {
    const { user } = useAuth();
    const [filterDate, setFilterDate] = useState("");

    const userId = user?.basicInfo?.userId;

    const {
        data: attendanceData,
        isLoading,
        isError,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ["student-attendance", userId],
        queryFn: async () => {
            const res = await apiGet<StudentAttendanceResponse>("/api/attendance/my-history");
            return res;
        },
        enabled: Boolean(userId),
        staleTime: 15 * 1000,
    });

    const logs = attendanceData?.logs || [];
    const stats = attendanceData?.stats || {
        totalPunches: 0,
        daysPresent: 0,
        cardNo: user?.biometricCardNo || "Unmapped",
    };

    // Filter logs if date selected
    const filteredLogs = filterDate
        ? logs.filter((l) => l.dateStr === filterDate)
        : logs;

    // Determine current status based on last punch
    const latestPunch = logs[0];
    const isCurrentlyInside = latestPunch ? latestPunch.inOut === "IN" : true;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Biometric Attendance & Gate Pass"
                subtitle="Live status, entry/exit logs from the RS20 turnstile, and campus curfew tracking"
                badge="REAL-TIME ATTENDANCE"
                action={
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-900/15 text-[#1F3A2D] font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#1F3A2D] ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Syncing..." : "Refresh"}
                    </button>
                }
            />

            {/* Current In/Out Gate Banner */}
            <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isCurrentlyInside
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/80 border-amber-200 text-amber-950"
            }`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isCurrentlyInside ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                    }`}>
                        {isCurrentlyInside ? <DoorClosed size={24} /> : <DoorOpen size={24} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800/80">
                                Current Campus Status
                            </span>
                            <span className={`inline-block w-2 h-2 rounded-full ${isCurrentlyInside ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
                        </div>
                        <h3 className="text-xl font-bold font-serif">
                            {isCurrentlyInside ? "Inside Hostel Premises" : "Checked Out of Campus"}
                        </h3>
                        <p className="text-xs text-emerald-900/70 mt-0.5">
                            {latestPunch
                                ? `Last recorded punch: ${latestPunch.inOut} at ${latestPunch.timeStr} (${latestPunch.dateStr})`
                                : "No punches recorded yet today."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[11px] font-mono text-emerald-900/60 uppercase block">Curfew Time</span>
                        <span className="text-sm font-bold font-mono text-emerald-900">09:00 PM Daily</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Days Present"
                    value={stats.daysPresent.toString()}
                    subtext="Days with gate activity"
                    icon={CheckCircle2}
                    color="#10b981"
                />
                <StatCard
                    label="Total Punches Logged"
                    value={stats.totalPunches.toString()}
                    subtext="Turnstile RFID scans"
                    icon={Fingerprint}
                    color="#1F3A2D"
                />
                <StatCard
                    label="RFID Card Number"
                    value={stats.cardNo || user?.biometricCardNo || "Unmapped"}
                    subtext="Smart card identifier"
                    icon={CreditCard}
                    color="#D8B56A"
                />
                <StatCard
                    label="Curfew Discipline"
                    value="Active"
                    subtext="Turnstile locked after 21:00"
                    icon={Clock}
                    color="#D35400"
                />
            </div>

            {/* Punch History Ledger */}
            <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/5">
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1F3A2D]">
                            Biometric Punch History
                        </h3>
                        <p className="text-xs text-emerald-900/60">
                            Recorded via biometric machine sensors at the main entrance gate
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/50 border border-emerald-900/10 text-xs text-[#1F3A2D]">
                            <Calendar size={13} className="text-emerald-800/60" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs text-[#1F3A2D]"
                            />
                            {filterDate && (
                                <button
                                    onClick={() => setFilterDate("")}
                                    className="text-[10px] text-emerald-800/50 hover:text-emerald-900 font-bold ml-1"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-8 space-y-3">
                        <LoadingSkeleton className="h-10 w-full rounded-xl" />
                        <LoadingSkeleton className="h-10 w-full rounded-xl" />
                        <LoadingSkeleton className="h-10 w-full rounded-xl" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-12 text-center text-emerald-900/50 space-y-2">
                        <Fingerprint size={32} className="mx-auto opacity-30 text-emerald-900" />
                        <p className="text-sm font-medium">No biometric attendance logs found</p>
                        <p className="text-xs text-emerald-900/40">
                            Punches recorded at the main gate turnstile will automatically sync here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-emerald-900/10 text-emerald-900/60 uppercase font-mono text-[10px]">
                                    <th className="py-3 px-3">Date</th>
                                    <th className="py-3 px-3">Time</th>
                                    <th className="py-3 px-3">Movement</th>
                                    <th className="py-3 px-3">Gate Terminal</th>
                                    <th className="py-3 px-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-900/5">
                                {filteredLogs.map((log) => {
                                    const isEntry = log.inOut === "IN";
                                    return (
                                        <tr key={log.id} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="py-3 px-3 font-mono font-medium text-emerald-950">
                                                {log.dateStr}
                                            </td>
                                            <td className="py-3 px-3 font-mono font-bold text-emerald-950">
                                                {log.timeStr}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    isEntry
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-amber-100 text-amber-800"
                                                }`}>
                                                    {isEntry ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                                                    {isEntry ? "ENTRY (IN)" : "EXIT (OUT)"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-emerald-900/70">
                                                {log.deviceSerial ? `Turnstile #${log.deviceSerial}` : "Main Campus Gate"}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Verified
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Attendance & Curfew Guidelines */}
            <div className="p-6 rounded-2xl bg-sand-light/50 border border-emerald-900/10 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#D8B56A]/20 text-[#9a7a3a] shrink-0 mt-0.5">
                    <Info size={20} />
                </div>
                <div className="space-y-1.5 text-xs text-emerald-900/80">
                    <h4 className="font-bold text-sm text-[#1F3A2D]">
                        Hostel Gate & Biometric Guidelines
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-emerald-900/70">
                        <li>Always tap your RFID Smart Card at the entry turnstile when entering or leaving the hostel.</li>
                        <li>Campus curfew is strictly <strong>09:00 PM</strong> every evening. Late entry requires prior Warden approval.</li>
                        <li>If you misplace your card, contact the Warden Office immediately to issue a replacement and protect your punch history.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
