"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bus, MapPin, Clock, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";

export default function TransportPage() {
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();

    const [selectedCycles, setSelectedCycles] = useState<Record<string, "monthly" | "yearly">>({});
    const [subscribingId, setSubscribingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const { data: stopsData, isLoading: loadingStops, refetch } = useQuery({
        queryKey: ["transport-stops"],
        queryFn: () => apiGet<any[]>(API.transport.stops),
    });

    const activePass = user?.transportPass;
    const hasAcquiredTransport = Boolean(activePass?.isOptedIn && activePass?.status === "active");
    const transportSummary = user?.paymentSummary?.transportFee || {};
    const baseFee = activePass?.basePrice || transportSummary.basePrice || (hasAcquiredTransport ? Math.round(transportSummary.total / 1.18) : 0);
    const gstAmount = activePass?.gstAmount || transportSummary.gstAmount || (hasAcquiredTransport ? transportSummary.total - baseFee : 0);
    const totalFee = activePass?.feeAmount || transportSummary.total || 0;

    // Handle Subscribe / Book Route Pass
    const handleSubscribe = async (stopId: string) => {
        setSubscribingId(stopId);
        setActionError(null);
        setActionSuccess(null);

        const cycle = selectedCycles[stopId] || "monthly";

        try {
            const res = await apiPost<any>(API.transport.subscribe, {
                stopId,
                billingCycle: cycle,
            });

            await refreshUser({ force: true });
            queryClient.invalidateQueries({ queryKey: ["transport-stops"] });
            setActionSuccess("Transport pass booked successfully! Your ledger and user schema have been updated in MongoDB.");
        } catch (err: any) {
            setActionError(err.message || "Failed to book transport pass.");
        } finally {
            setSubscribingId(null);
        }
    };

    // Handle Cancel Transport Pass
    const handleCancelPass = async () => {
        if (!confirm("Are you sure you want to cancel your transport pass? This will remove pending transport dues.")) return;

        setSubscribingId("cancel");
        setActionError(null);
        setActionSuccess(null);

        try {
            await apiPost<any>(API.transport.cancel, {});
            await refreshUser({ force: true });
            queryClient.invalidateQueries({ queryKey: ["transport-stops"] });
            setActionSuccess("Transport pass cancelled successfully and pending transport dues cleared.");
        } catch (err: any) {
            setActionError(err.message || "Failed to cancel transport pass.");
        } finally {
            setSubscribingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F4] p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Campus Shuttle & Route Pass Booking"
                    subtitle="Select your GLA University shuttle pickup route to acquire an active transport pass (+18% GST Applicable)"
                    badge={hasAcquiredTransport ? "PASS ACTIVE" : "NO PASS ACQUIRED"}
                    action={
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-900/15 text-[#1F3A2D] font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all"
                        >
                            <RefreshCw className="w-4 h-4 text-[#1F3A2D]" /> Refresh Routes
                        </button>
                    }
                />

                {actionError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>{actionError}</span>
                    </div>
                )}

                {actionSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{actionSuccess}</span>
                    </div>
                )}

                {/* Digital Bus Pass Card */}
                <div className={`p-6 rounded-2xl border shadow-md flex items-center justify-between flex-wrap gap-4 text-white ${
                    hasAcquiredTransport ? "bg-[#1F3A2D] border-emerald-900/20" : "bg-neutral-800 border-neutral-700"
                }`}>
                    <div>
                        <span className="font-mono text-xs text-[#D8B56A] uppercase font-bold tracking-wider block mb-1">
                            Digital Shuttle Pass
                        </span>
                        <h3 className="font-serif text-2xl font-bold text-white m-0">
                            {user?.basicInfo?.fullName || "Student Pass"}
                        </h3>
                        <p className="text-xs text-white/70 mt-1 m-0">
                            {user?.basicInfo?.userId || "ID"} · {hasAcquiredTransport ? `Route: ${activePass?.stopName}` : "No Route Selected"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {hasAcquiredTransport ? (
                            <>
                                <div className="text-right">
                                    <span className="font-mono text-[0.65rem] text-[#D8B56A] uppercase font-bold block">
                                        Base: ₹{baseFee.toLocaleString("en-IN")} + 18% GST (₹{gstAmount.toLocaleString("en-IN")})
                                    </span>
                                    <span className="font-mono text-sm font-bold text-white block">
                                        Total Fee: ₹{totalFee.toLocaleString("en-IN")} ({activePass?.billingCycle})
                                    </span>
                                </div>

                                <div className="px-3.5 py-1.5 rounded-xl border bg-emerald-500/20 border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="font-mono text-xs font-bold uppercase">ACTIVE PASS</span>
                                </div>

                                {transportSummary.remaining > 0 && (
                                    <Link
                                        href="/student/payment"
                                        className="px-4 py-2 rounded-xl bg-[#D8B56A] text-[#1F3A2D] font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        Pay Dues (₹{transportSummary.remaining.toLocaleString("en-IN")}) <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                )}

                                <button
                                    onClick={handleCancelPass}
                                    disabled={subscribingId === "cancel"}
                                    className="px-3.5 py-2 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 font-semibold text-xs hover:bg-red-500/25 transition-all flex items-center gap-1.5 shadow-xs"
                                >
                                    <XCircle className="w-4 h-4 text-red-400" /> Cancel Pass
                                </button>
                            </>
                        ) : (
                            <div className="px-4 py-2 rounded-xl border bg-red-500/20 border-red-500/30 text-red-300 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-mono text-xs font-bold uppercase">NO ROUTE BOOKED</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Route Stops for Booking */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">Select Shuttle Pickup Route</h3>
                            <p className="text-xs text-emerald-900/60 m-0">Select a route below to calculate 18% GST and book your digital pass directly to your MongoDB record.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-emerald-900/10 overflow-hidden shadow-sm">
                        {loadingStops ? (
                            <div className="p-8">
                                <LoadingSkeleton count={3} />
                            </div>
                        ) : (stopsData || []).length === 0 ? (
                            <div className="p-12 text-center text-xs text-emerald-900/50">
                                No transport route stops available for booking right now.
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                {(stopsData || []).map((stopItem: any) => {
                                    const stopId = stopItem._id || stopItem.id;
                                    const cycle = selectedCycles[stopId] || "monthly";

                                    const basePrice = cycle === "yearly"
                                        ? (stopItem.yearly?.basePrice || Number(stopItem.yearlyPrice) || 20000)
                                        : (stopItem.monthly?.basePrice || Number(stopItem.monthlyPrice) || 2000);

                                    const gstVal = Math.round(basePrice * 0.18);
                                    const totalWithGst = basePrice + gstVal;
                                    const isCurrentRoute = activePass?.stopId === stopId && activePass?.status === "active";

                                    return (
                                        <div
                                            key={stopId}
                                            className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                                isCurrentRoute ? "bg-emerald-50/50 border-emerald-900/30" : "bg-white border-emerald-900/10 hover:border-emerald-900/25"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-900/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Bus className="w-5 h-5 text-[#1F3A2D]" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-serif text-base font-bold text-[#1F3A2D] m-0">
                                                            {stopItem.stopName || stopItem.name}
                                                        </h4>
                                                        {isCurrentRoute && (
                                                            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase bg-emerald-500/15 text-emerald-800">
                                                                SELECTED ROUTE
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-emerald-900/60 mt-1 m-0 font-mono">
                                                        Pickup: {stopItem.pickupTime || "07:30 AM"} · Drop: {stopItem.dropTime || "05:30 PM"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 flex-wrap self-end md:self-center">
                                                {/* Cycle Switcher */}
                                                <div className="flex items-center p-1 rounded-xl bg-emerald-900/5 border border-emerald-900/10 text-xs">
                                                    <button
                                                        onClick={() => setSelectedCycles((prev) => ({ ...prev, [stopId]: "monthly" }))}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-[0.7rem] transition-all ${
                                                            cycle === "monthly" ? "bg-[#1F3A2D] text-white shadow-xs" : "text-emerald-900/70 hover:text-[#1F3A2D]"
                                                        }`}
                                                    >
                                                        Monthly
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedCycles((prev) => ({ ...prev, [stopId]: "yearly" }))}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-[0.7rem] transition-all ${
                                                            cycle === "yearly" ? "bg-[#1F3A2D] text-white shadow-xs" : "text-emerald-900/70 hover:text-[#1F3A2D]"
                                                        }`}
                                                    >
                                                        Yearly
                                                    </button>
                                                </div>

                                                {/* Price Breakdown */}
                                                <div className="text-right">
                                                    <span className="text-[0.68rem] text-emerald-900/60 font-mono block">
                                                        Base ₹{basePrice.toLocaleString("en-IN")} + 18% GST (₹{gstVal.toLocaleString("en-IN")})
                                                    </span>
                                                    <span className="font-mono text-sm font-bold text-[#1F3A2D] block">
                                                        ₹{totalWithGst.toLocaleString("en-IN")} <span className="text-[0.68rem] font-normal text-emerald-900/60">/{cycle}</span>
                                                    </span>
                                                </div>

                                                {/* Booking Action Button */}
                                                <button
                                                    onClick={() => handleSubscribe(stopId)}
                                                    disabled={subscribingId === stopId || isCurrentRoute}
                                                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                                                        isCurrentRoute
                                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                                                            : "bg-[#1F3A2D] text-white hover:bg-emerald-900 border border-emerald-950"
                                                    }`}
                                                >
                                                    {subscribingId === stopId
                                                        ? "Updating Schema..."
                                                        : isCurrentRoute
                                                        ? "Active Route"
                                                        : `Book ${cycle === "yearly" ? "Yearly" : "Monthly"} Pass`}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
