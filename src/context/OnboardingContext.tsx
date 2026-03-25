"use client";

import {
    createContext, useContext, useState, useCallback, useEffect, useRef,
    ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────

export interface UploadedFile {
    name: string;
    preview: string;
}

export interface Step1Data {
    fullName: string;
    dateOfBirth: string;
    idType: string;
    idNumber: string;
    idFront: UploadedFile | null;
    idBack: UploadedFile | null;
}

export interface Step2Data {
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
    alternatePhone: string;
    parentIdType: string;
    parentIdNumber: string;
    parentIdFront: UploadedFile | null;
    parentIdBack: UploadedFile | null;
}

export interface SelectedRoom {
    id: string;
    title: string;
    type: string;
    price: number;
    priceLabel: string;
    originalPrice?: string;
}

export interface AddOnService {
    id: string;
    name: string;
    price: number;
    enabled: boolean;
}

export interface Step3Data {
    selectedRoom: SelectedRoom | null;
    addOns: AddOnService[];
}

export interface PaymentData {
    method: "bank_transfer" | "cash_deposit" | "";
    transactionId: string;
    screenshot: UploadedFile | null;
}

export type OnboardingStatus = "pending" | "payment_submitted" | "move_in_approved";

export interface OnboardingState {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    payment: PaymentData;
    status: OnboardingStatus;
    completedSteps: number[];
}

// ── Defaults ─────────────────────────────────────────────────

const DEFAULT_ADD_ONS: AddOnService[] = [
    { id: "transport", name: "Daily Transport", price: 2500, enabled: false },
    { id: "lunch", name: "Lunch Add-on", price: 1500, enabled: false },
];

const INITIAL_STATE: OnboardingState = {
    step1: {
        fullName: "",
        dateOfBirth: "",
        idType: "aadhaar",
        idNumber: "",
        idFront: null,
        idBack: null,
    },
    step2: {
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelation: "",
        alternatePhone: "",
        parentIdType: "aadhaar",
        parentIdNumber: "",
        parentIdFront: null,
        parentIdBack: null,
    },
    step3: {
        selectedRoom: null,
        addOns: DEFAULT_ADD_ONS,
    },
    payment: {
        method: "",
        transactionId: "",
        screenshot: null,
    },
    status: "pending",
    completedSteps: [],
};

const STORAGE_KEY = "viramah_onboarding";

// ── localStorage helpers ─────────────────────────────────────

function loadFromStorage(): OnboardingState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as OnboardingState;
    } catch {
        return null;
    }
}

function saveToStorage(state: OnboardingState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage full or unavailable — silently ignore
    }
}

// ── Context ──────────────────────────────────────────────────

interface OnboardingContextType {
    state: OnboardingState;
    hydrating: boolean;
    saving: boolean;
    updateStep1: (data: Partial<Step1Data>) => void;
    updateStep2: (data: Partial<Step2Data>) => void;
    updateStep3: (data: Partial<Step3Data>) => void;
    updatePayment: (data: Partial<PaymentData>) => void;
    toggleAddOn: (id: string) => void;
    markStepComplete: (step: number) => void;
    isStepComplete: (step: number) => boolean;
    canAccessStep: (step: number) => boolean;
    getTotalCost: () => number;
    getAddOnsTotal: () => number;
    setStatus: (status: OnboardingStatus) => void;
    resetOnboarding: () => void;
    saveStepToBackend: (step: number, payload: Record<string, unknown>) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
    state: INITIAL_STATE,
    hydrating: true,
    saving: false,
    updateStep1: () => {},
    updateStep2: () => {},
    updateStep3: () => {},
    updatePayment: () => {},
    toggleAddOn: () => {},
    markStepComplete: () => {},
    isStepComplete: () => false,
    canAccessStep: () => false,
    getTotalCost: () => 0,
    getAddOnsTotal: () => 0,
    setStatus: () => {},
    resetOnboarding: () => {},
    saveStepToBackend: async () => {},
});

// ── Provider ─────────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
    const [hydrating, setHydrating] = useState(true);
    const [saving, setSaving] = useState(false);
    const didHydrate = useRef(false);

    // ── Hydration: localStorage first, then backend ──────────
    useEffect(() => {
        if (didHydrate.current) return;
        didHydrate.current = true;

        // 1. Immediate restore from localStorage (instant)
        const cached = loadFromStorage();
        if (cached) {
            setState(cached);
        }

        // 2. Attempt backend hydration (async, best-effort)
        (async () => {
            try {
                const res = await apiFetch<{
                    data: {
                        onboardingStatus: string;
                        name: string;
                        dateOfBirth: string;
                        idType: string;
                        idNumber: string;
                        documents: { idProof: string; addressProof: string; photo: string };
                        emergencyContact: { name: string; phone: string; relation: string };
                        parentDocuments: { idType: string; idNumber: string; idFront: string; idBack: string };
                        selectedRoom: { _id: string; roomNumber: string; roomType: string; pricePerMonth: number } | null;
                        roomNumber: string;
                        roomType: string;
                        messPackage: string;
                        preferences: { diet: string; sleepSchedule: string; noise: string };
                        paymentStatus: string;
                    };
                }>("/api/public/onboarding/status");

                const d = res.data;
                const completedSteps: number[] = [];

                // Infer completed steps from backend data
                if (d.documents?.idProof) completedSteps.push(1);
                if (d.emergencyContact?.name && d.emergencyContact?.phone) completedSteps.push(2);
                if (d.selectedRoom) completedSteps.push(3);
                if (d.preferences?.diet) completedSteps.push(4);

                setState((prev) => {
                    const merged: OnboardingState = {
                        ...prev,
                        completedSteps: [
                            ...new Set([...prev.completedSteps, ...completedSteps]),
                        ],
                    };

                    // Restore Step 1: KYC text fields from backend
                    if (d.name || d.idNumber) {
                        merged.step1 = {
                            ...prev.step1,
                            fullName: d.name || prev.step1.fullName,
                            dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split("T")[0] : prev.step1.dateOfBirth,
                            idType: d.idType || prev.step1.idType,
                            idNumber: d.idNumber || prev.step1.idNumber,
                        };
                    }

                    // Restore Step 2: emergency contact + parent docs
                    if (d.emergencyContact?.name) {
                        merged.step2 = {
                            ...prev.step2,
                            emergencyName: d.emergencyContact.name || prev.step2.emergencyName,
                            emergencyPhone: d.emergencyContact.phone || prev.step2.emergencyPhone,
                            emergencyRelation: d.emergencyContact.relation || prev.step2.emergencyRelation,
                            parentIdType: d.parentDocuments?.idType || prev.step2.parentIdType,
                            parentIdNumber: d.parentDocuments?.idNumber || prev.step2.parentIdNumber,
                        };
                    }

                    // Restore Step 3: room selection from backend
                    if (d.selectedRoom) {
                        // Map backend roomType to frontend room data
                        const ROOM_TYPE_REVERSE: Record<string, { id: string; title: string; type: string; priceLabel: string }> = {
                            "VIRAMAH Nexus": { id: "nexus-plus", title: "Nexus Plus", type: "Shared Room", priceLabel: `₹${d.selectedRoom.pricePerMonth?.toLocaleString()}` },
                            "VIRAMAH Collective": { id: "collective-plus", title: "Collective Plus", type: "Shared Room", priceLabel: `₹${d.selectedRoom.pricePerMonth?.toLocaleString()}` },
                            "VIRAMAH Axis": { id: "axis", title: "Axis", type: "Private Room", priceLabel: `₹${d.selectedRoom.pricePerMonth?.toLocaleString()}` },
                            "VIRAMAH Axis+": { id: "studio", title: "Axis+", type: "Studio", priceLabel: `₹${d.selectedRoom.pricePerMonth?.toLocaleString()}` },
                        };
                        const roomInfo = ROOM_TYPE_REVERSE[d.selectedRoom.roomType];
                        if (roomInfo) {
                            merged.step3 = {
                                ...prev.step3,
                                selectedRoom: {
                                    id: roomInfo.id,
                                    title: roomInfo.title,
                                    type: roomInfo.type,
                                    price: d.selectedRoom.pricePerMonth,
                                    priceLabel: roomInfo.priceLabel,
                                },
                            };
                            // Restore add-on state from messPackage
                            if (d.messPackage === "full-board") {
                                merged.step3.addOns = merged.step3.addOns.map((a) =>
                                    a.id === "lunch" ? { ...a, enabled: true } : a
                                );
                            }
                        }
                    }

                    // Map backend status to frontend status
                    if (d.onboardingStatus === "completed") {
                        merged.status = "payment_submitted";
                    }
                    if (d.paymentStatus === "approved") {
                        merged.status = "move_in_approved";
                    }

                    return merged;
                });
            } catch {
                // Not logged in or network error — continue with localStorage data
            } finally {
                setHydrating(false);
            }
        })();
    }, []);

    // ── Persist to localStorage on every state change ────────
    useEffect(() => {
        if (hydrating) return;
        saveToStorage(state);
    }, [state, hydrating]);

    // ── Step update helpers ──────────────────────────────────

    const updateStep1 = useCallback((data: Partial<Step1Data>) => {
        setState((prev) => ({ ...prev, step1: { ...prev.step1, ...data } }));
    }, []);

    const updateStep2 = useCallback((data: Partial<Step2Data>) => {
        setState((prev) => ({ ...prev, step2: { ...prev.step2, ...data } }));
    }, []);

    const updateStep3 = useCallback((data: Partial<Step3Data>) => {
        setState((prev) => ({ ...prev, step3: { ...prev.step3, ...data } }));
    }, []);

    const updatePayment = useCallback((data: Partial<PaymentData>) => {
        setState((prev) => ({ ...prev, payment: { ...prev.payment, ...data } }));
    }, []);

    const toggleAddOn = useCallback((id: string) => {
        setState((prev) => ({
            ...prev,
            step3: {
                ...prev.step3,
                addOns: prev.step3.addOns.map((a) =>
                    a.id === id ? { ...a, enabled: !a.enabled } : a
                ),
            },
        }));
    }, []);

    const markStepComplete = useCallback((step: number) => {
        setState((prev) => ({
            ...prev,
            completedSteps: prev.completedSteps.includes(step)
                ? prev.completedSteps
                : [...prev.completedSteps, step],
        }));
    }, []);

    const isStepComplete = useCallback(
        (step: number) => state.completedSteps.includes(step),
        [state.completedSteps]
    );

    const canAccessStep = useCallback(
        (step: number) => {
            if (step === 1) return true;
            return state.completedSteps.includes(step - 1);
        },
        [state.completedSteps]
    );

    const getAddOnsTotal = useCallback(() => {
        return state.step3.addOns
            .filter((a) => a.enabled)
            .reduce((sum, a) => sum + a.price, 0);
    }, [state.step3.addOns]);

    const getTotalCost = useCallback(() => {
        const roomPrice = state.step3.selectedRoom?.price ?? 0;
        return roomPrice + getAddOnsTotal();
    }, [state.step3.selectedRoom, getAddOnsTotal]);

    const setStatus = useCallback((status: OnboardingStatus) => {
        setState((prev) => ({ ...prev, status }));
    }, []);

    const resetOnboarding = useCallback(() => {
        setState(INITIAL_STATE);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }, []);

    // ── Save step to backend (called from step pages) ────────
    const saveStepToBackend = useCallback(
        async (step: number, payload: Record<string, unknown>) => {
            setSaving(true);
            try {
                const method = step === 0 ? "POST" : "PATCH";
                const path =
                    step === 0
                        ? "/api/public/onboarding/confirm"
                        : `/api/public/onboarding/step-${step}`;

                await apiFetch(path, { method, body: payload });
            } finally {
                setSaving(false);
            }
        },
        []
    );

    return (
        <OnboardingContext.Provider
            value={{
                state,
                hydrating,
                saving,
                updateStep1,
                updateStep2,
                updateStep3,
                updatePayment,
                toggleAddOn,
                markStepComplete,
                isStepComplete,
                canAccessStep,
                getTotalCost,
                getAddOnsTotal,
                setStatus,
                resetOnboarding,
                saveStepToBackend,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    return useContext(OnboardingContext);
}
