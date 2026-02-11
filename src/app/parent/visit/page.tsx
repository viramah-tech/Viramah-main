"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, Check, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getVisitRequests, scheduleVisit } from "@/app/actions/dashboard";

interface VisitRequest {
    id: number;
    guest_name: string;
    guest_relation: string | null;
    visit_date: string;
    status: 'pending' | 'approved' | 'declined';
    created_at: string;
}

const TIME_SLOTS = ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];
const STATUS_COLORS = {
    pending: "bg-gold/20 text-gold",
    approved: "bg-sage-muted/20 text-sage-muted",
    declined: "bg-red-100 text-red-600",
};

export default function VisitPage() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [guestName, setGuestName] = useState(user?.name || "");
    const [visits, setVisits] = useState<VisitRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const loadVisits = useCallback(async () => {
        const data = await getVisitRequests();
        setVisits(data as VisitRequest[]);
        setIsLoading(false);
    }, []);

    useEffect(() => { loadVisits(); }, [loadVisits]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        const fd = new FormData();
        fd.append("visitDate", selectedDate);
        fd.append("guestName", guestName || user?.name || "Parent");
        fd.append("guestRelation", "Parent/Guardian");
        fd.append("purpose", purpose);

        const result = await scheduleVisit(fd);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            setSelectedDate("");
            setSelectedTime("");
            setPurpose("");
            await loadVisits();
        }
        setIsSubmitting(false);
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-IN", {
            weekday: "long", month: "short", day: "numeric"
        });
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="font-display text-4xl text-charcoal">Schedule a Visit</h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Plan your visit to Viramah. All visits require prior scheduling.
                </p>
            </motion.div>

            {/* Visit Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl border border-sand-dark p-8 space-y-6"
            >
                <FormInput
                    label="Your Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    hint="Name of the visitor"
                />

                <FormInput
                    label="Visit Date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    hint="Visits are available Monday to Saturday"
                />

                {/* Time Slot Selection */}
                <div>
                    <label className="flex items-center gap-2 font-body text-sm font-medium text-charcoal/70 mb-3">
                        <Clock className="w-4 h-4" />Select Time Slot
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {TIME_SLOTS.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => setSelectedTime(slot)}
                                className={`py-3 rounded-xl border-2 font-mono text-xs transition-all duration-300 ${selectedTime === slot
                                        ? "border-terracotta-raw bg-terracotta-raw/10 text-terracotta-raw"
                                        : "border-sand-dark text-charcoal/60 hover:border-charcoal/30"
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                <FormInput
                    label="Purpose of Visit (Optional)"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    hint="e.g., Monthly visit, bringing supplies"
                />

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="font-body text-sm text-red-600">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-3 rounded-xl bg-sage-muted/10 border border-sage-muted/30 flex items-center gap-2">
                        <Check className="w-4 h-4 text-sage-muted" />
                        <p className="font-body text-sm text-sage-muted">Visit request submitted successfully!</p>
                    </div>
                )}

                <Button
                    size="lg" className="w-full gap-2"
                    disabled={isSubmitting || !selectedDate}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Scheduling...</>
                    ) : (
                        <><Check className="w-4 h-4" />Confirm Visit</>
                    )}
                </Button>
            </motion.div>

            {/* Scheduled Visits */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <h2 className="font-body font-medium text-charcoal mb-4">Your Scheduled Visits</h2>
                {isLoading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-charcoal/30" />
                    </div>
                ) : visits.length === 0 ? (
                    <div className="py-8 text-center">
                        <Calendar className="w-12 h-12 text-charcoal/10 mx-auto mb-3" />
                        <p className="font-body text-charcoal/50 text-sm">No visits scheduled</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visits.map(visit => (
                            <div key={visit.id} className="p-4 rounded-xl bg-sand-light/30 border border-sand-dark/20 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-terracotta-raw flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <span className="font-body text-sm font-medium text-charcoal block">{formatDate(visit.visit_date)}</span>
                                    <span className="font-mono text-xs text-charcoal/50">{visit.guest_name}{visit.guest_relation ? ` (${visit.guest_relation})` : ""}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[visit.status]}`}>
                                    {visit.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
