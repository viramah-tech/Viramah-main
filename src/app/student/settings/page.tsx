"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { User, Bell, Lock, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "+91 98XXX XXXXX",
    });

    useEffect(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                name: user.fullName,
                email: user.email,
            }));
        }
    }, [user]);

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-display text-4xl text-charcoal">Settings</h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Manage your profile and preferences
                </p>
            </motion.div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-terracotta-raw" />
                    <span className="font-body font-medium text-charcoal">Profile Information</span>
                </div>
                <div className="space-y-4">
                    <FormInput
                        label="Full Name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                    <FormInput
                        label="Email Address"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                    <FormInput
                        label="Phone Number"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                </div>
                <div className="mt-6">
                    <Button className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>
            </motion.div>

            {/* Notifications Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-gold" />
                    <span className="font-body font-medium text-charcoal">Notifications</span>
                </div>
                <div className="space-y-4">
                    {["Email notifications", "Push notifications", "SMS alerts"].map((item) => (
                        <div key={item} className="flex items-center justify-between p-3 rounded-xl hover:bg-sand-light/50">
                            <span className="font-body text-sm text-charcoal">{item}</span>
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-terracotta-raw" />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-5 h-5 text-sage-muted" />
                    <span className="font-body font-medium text-charcoal">Security</span>
                </div>
                <Button variant="secondary">Change Password</Button>
            </motion.div>
        </div>
    );
}
