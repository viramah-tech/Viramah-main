"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, Check } from "lucide-react";

const TIME_SLOTS = ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

export default function VisitPage() {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [purpose, setPurpose] = useState("");

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-display text-4xl text-charcoal">Schedule a Visit</h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Plan your visit to Viramah. All visits require prior scheduling.
                </p>
            </motion.div>

            {/* Visit Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl border border-sand-dark p-8 space-y-6"
            >
                {/* Date Selection */}
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
                        <Clock className="w-4 h-4" />
                        Select Time Slot
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

                {/* Purpose */}
                <FormInput
                    label="Purpose of Visit (Optional)"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    hint="e.g., Monthly visit, bringing supplies"
                />

                {/* Submit */}
                <Button size="lg" className="w-full gap-2">
                    <Check className="w-4 h-4" />
                    Confirm Visit
                </Button>
            </motion.div>

            {/* Upcoming Visits */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <h2 className="font-body font-medium text-charcoal mb-4">Your Scheduled Visits</h2>
                <div className="p-4 rounded-xl bg-terracotta-raw/5 border border-terracotta-raw/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-terracotta-raw flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <span className="font-body text-sm font-medium text-charcoal block">Saturday, Feb 15</span>
                        <span className="font-mono text-xs text-charcoal/50">2:00 PM - 4:00 PM</span>
                    </div>
                    <Button variant="secondary" size="sm">Reschedule</Button>
                </div>
            </motion.div>
        </div>
    );
}
