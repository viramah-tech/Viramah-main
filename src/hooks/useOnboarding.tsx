"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ───────────────────────────────────────────────────

interface KycData {
    fullName: string;
    dateOfBirth: string;
    idType: "aadhaar" | "passport" | "voter_id";
    idNumber: string;
    idFrontUrl: string | null;
    idBackUrl: string | null;
}

interface EmergencyContactData {
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
    alternatePhone: string;
    parentIdType: "aadhaar" | "passport" | "voter_id";
    parentIdNumber: string;
    parentIdFrontUrl: string | null;
    parentIdBackUrl: string | null;
}

interface RoomSelectionData {
    roomId: string | null;
    roomNumber: string;
    roomType: string;
    roomPrice: number;
    securityDeposit: number;
    floor: number;
    facing: string;
    messPackageId: string;
    messPackageName: string;
    messPackagePrice: number;
}

interface PreferencesData {
    dietary: string;
    sleep: string;
    noise: string;
}

export interface OnboardingData {
    kyc: KycData;
    emergency: EmergencyContactData;
    roomSelection: RoomSelectionData;
    preferences: PreferencesData;
    currentStep: number;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateKyc: (kyc: Partial<KycData>) => void;
    updateEmergency: (emergency: Partial<EmergencyContactData>) => void;
    updateRoomSelection: (room: Partial<RoomSelectionData>) => void;
    updatePreferences: (prefs: Partial<PreferencesData>) => void;
    setCurrentStep: (step: number) => void;
    uploadFile: (file: File, path: string) => Promise<string | null>;
    submitOnboarding: () => Promise<{ error: string | null }>;
    isSaving: boolean;
}

const DEFAULT_DATA: OnboardingData = {
    kyc: {
        fullName: "",
        dateOfBirth: "",
        idType: "aadhaar",
        idNumber: "",
        idFrontUrl: null,
        idBackUrl: null,
    },
    emergency: {
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelation: "",
        alternatePhone: "",
        parentIdType: "aadhaar",
        parentIdNumber: "",
        parentIdFrontUrl: null,
        parentIdBackUrl: null,
    },
    roomSelection: {
        roomId: null,
        roomNumber: "",
        roomType: "",
        roomPrice: 0,
        securityDeposit: 0,
        floor: 0,
        facing: "",
        messPackageId: "full",
        messPackageName: "Full Board",
        messPackagePrice: 4500,
    },
    preferences: {
        dietary: "",
        sleep: "",
        noise: "",
    },
    currentStep: 1,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────
export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const { user, refreshProfile } = useAuth();

    const updateKyc = useCallback((kyc: Partial<KycData>) => {
        setData(prev => ({ ...prev, kyc: { ...prev.kyc, ...kyc } }));
    }, []);

    const updateEmergency = useCallback((emergency: Partial<EmergencyContactData>) => {
        setData(prev => ({ ...prev, emergency: { ...prev.emergency, ...emergency } }));
    }, []);

    const updateRoomSelection = useCallback((room: Partial<RoomSelectionData>) => {
        setData(prev => ({ ...prev, roomSelection: { ...prev.roomSelection, ...room } }));
    }, []);

    const updatePreferences = useCallback((prefs: Partial<PreferencesData>) => {
        setData(prev => ({ ...prev, preferences: { ...prev.preferences, ...prefs } }));
    }, []);

    const setCurrentStep = useCallback((step: number) => {
        setData(prev => ({ ...prev, currentStep: step }));
    }, []);

    // Upload a file to Supabase Storage
    const uploadFile = useCallback(async (file: File, path: string): Promise<string | null> => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${user?.userId || "unknown"}/${path}.${fileExt}`;

            const { error } = await supabase.storage
                .from("documents")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (error) {
                console.error("[Onboarding] Upload error:", error.message);
                return null;
            }

            const { data: urlData } = supabase.storage
                .from("documents")
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (err) {
            console.error("[Onboarding] Upload failed:", err);
            return null;
        }
    }, [user?.userId]);

    // Submit all onboarding data to Supabase
    const submitOnboarding = useCallback(async (): Promise<{ error: string | null }> => {
        if (!user?.userId) return { error: "Not authenticated" };

        setIsSaving(true);
        try {
            // 1. Get the profile ID
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", user.userId)
                .single();

            if (profileError || !profileData) {
                return { error: "Profile not found. Please try again." };
            }

            const profileId = profileData.id;

            // 2. Save KYC document
            if (data.kyc.idNumber) {
                const { error: kycError } = await supabase
                    .from("kyc_documents")
                    .upsert({
                        profile_id: profileId,
                        document_type: data.kyc.idType,
                        document_number: data.kyc.idNumber,
                        front_image_url: data.kyc.idFrontUrl,
                        back_image_url: data.kyc.idBackUrl,
                        status: "pending",
                    }, { onConflict: "profile_id" });

                if (kycError) {
                    console.error("[Onboarding] KYC save error:", kycError);
                }
            }

            // 3. Save emergency contact
            if (data.emergency.emergencyName && data.emergency.emergencyPhone) {
                const { error: contactError } = await supabase
                    .from("emergency_contacts")
                    .upsert({
                        created_by: profileId,
                        contact_name: data.emergency.emergencyName,
                        phone: data.emergency.emergencyPhone,
                        relationship: data.emergency.emergencyRelation.toLowerCase(),
                        alt_phone: data.emergency.alternatePhone || null,
                    }, { onConflict: "created_by" });

                if (contactError) {
                    console.error("[Onboarding] Emergency contact save error:", contactError);
                }
            }

            // 4. Update profile with preferences and KYC status
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    full_name: data.kyc.fullName || user.fullName,
                    date_of_birth: data.kyc.dateOfBirth || null,
                    kyc_status: "submitted",
                    preferences: {
                        dietary: data.preferences.dietary,
                        sleep: data.preferences.sleep,
                        noise: data.preferences.noise,
                    },
                })
                .eq("id", profileId);

            if (updateError) {
                console.error("[Onboarding] Profile update error:", updateError);
            }

            // 5. Create booking if room is selected
            if (data.roomSelection.roomId) {
                const { error: bookingError } = await supabase
                    .from("bookings")
                    .insert({
                        profile_id: profileId,
                        room_id: data.roomSelection.roomId,
                        check_in: new Date().toISOString(),
                        total_amount: data.roomSelection.roomPrice + data.roomSelection.messPackagePrice,
                        security_deposit: data.roomSelection.securityDeposit,
                        status: "pending",
                        mess_plan: data.roomSelection.messPackageId,
                    });

                if (bookingError) {
                    console.error("[Onboarding] Booking error:", bookingError);
                }
            }

            // 6. Refresh profile to get updated data
            await refreshProfile();

            return { error: null };
        } catch (err) {
            console.error("[Onboarding] Submit error:", err);
            return { error: "Failed to save onboarding data. Please try again." };
        } finally {
            setIsSaving(false);
        }
    }, [data, user, refreshProfile]);

    return (
        <OnboardingContext.Provider
            value={{
                data,
                updateKyc,
                updateEmergency,
                updateRoomSelection,
                updatePreferences,
                setCurrentStep,
                uploadFile,
                submitOnboarding,
                isSaving,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────
export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}
