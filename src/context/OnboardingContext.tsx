"use client";

import {
    createContext, useContext, useState, useCallback, useEffect, useRef,
    ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
    profilePhoto: UploadedFile | null;
    gender: string;
    address: string;
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
    backendId?: string;
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
    method: "bank_transfer" | "cash_deposit" | "upi" | "";
    transactionId: string;
    screenshot: UploadedFile | null;
}

export interface Step4Data {
    // Gender and address moved to Step1Data.
    // Interface kept for backward compatibility with state shape.
}

export type OnboardingStatus = "pending" | "payment_submitted" | "doc_verification_pending" | "move_in_pending" | "move_in_approved";

export interface OnboardingState {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    payment: PaymentData;
    status: OnboardingStatus;
    completedSteps: number[];
}

// ── Defaults ─────────────────────────────────────────────────

const DEFAULT_ADD_ONS: AddOnService[] = [
    { id: "transport", name: "Daily Transport", price: 2000, enabled: false },
    { id: "lunch", name: "Lunch Add-on", price: 2000, enabled: false },
];

const INITIAL_STATE: OnboardingState = {
    step1: {
        fullName: "",
        dateOfBirth: "",
        idType: "aadhaar",
        idNumber: "",
        idFront: null,
        idBack: null,
        profilePhoto: null,
        gender: "",
        address: "",
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
    step4: {},

    payment: {
        method: "",
        transactionId: "",
        screenshot: null,
    },
    status: "pending",
    completedSteps: [],
};

// ── localStorage helpers (user-scoped) ──────────────────────

function getStorageKey(userId?: string): string | null {
    return userId ? `viramah_onboarding_${userId}` : null;
}

function loadFromStorage(key: string | null): OnboardingState | null {
    if (!key) return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as OnboardingState;
    } catch {
        return null;
    }
}

function saveToStorage(key: string | null, state: OnboardingState) {
    if (!key) return;
    try {
        localStorage.setItem(key, JSON.stringify(state));
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
    updateStep4: (data: Partial<Step4Data>) => void;
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
    updateStep4: () => {},
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
    const { user } = useAuth();
    const storageKeyRef = useRef<string | null>(null);

    // Update storage key when user changes
    useEffect(() => {
        storageKeyRef.current = getStorageKey(user?._id);
    }, [user?._id]);

    // ── Hydration: wait for user, then localStorage + backend ──
    useEffect(() => {
        if (didHydrate.current) return;
        if (!user?._id) {
            // No user yet — skip localStorage, just finish hydrating
            setHydrating(false);
            return;
        }
        didHydrate.current = true;

        const storageKey = getStorageKey(user._id);
        storageKeyRef.current = storageKey;

        // 1. Immediate restore from user-scoped localStorage (instant)
        const cached = loadFromStorage(storageKey);
        if (cached) {
            setState({
                ...INITIAL_STATE,
                ...cached,
                step1: { ...INITIAL_STATE.step1, ...cached.step1 },
                step2: { ...INITIAL_STATE.step2, ...cached.step2 },
                step3: { ...INITIAL_STATE.step3, ...cached.step3 },
                step4: { ...INITIAL_STATE.step4, ...cached.step4 },
                payment: { ...INITIAL_STATE.payment, ...cached.payment },
            });
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
                        selectedRoomType: string;
                        roomNumber: string;
                        roomType: string;
                        messPackage: string;
                        selectedAddOns: { transport: boolean; mess: boolean; messLumpSum: boolean };
                        gender: string;
                        address: string;
                        paymentStatus: string;
                    };
                }>("/api/public/onboarding/status");

                let fetchedRooms: { _id: string; name: string; basePrice?: number; discountedPrice?: number; pricing?: { discounted: number } }[] = [];
                try {
                    const roomsRes = await apiFetch<{ data: { roomTypes: { _id: string; name: string; basePrice?: number; discountedPrice?: number; pricing?: { discounted: number } }[] } }>("/api/public/rooms");
                    fetchedRooms = roomsRes.data.roomTypes || [];
                } catch (e) {
                    console.error("Failed to fetch rooms during hydration:", e);
                }

                const d = res.data as {
                    onboardingStatus: string;
                    name: string;
                    dateOfBirth: string;
                    idType: string;
                    idNumber: string;
                    documents: { idProof: string; addressProof: string; photo: string };
                    emergencyContact: { name: string; phone: string; relation: string };
                    parentDocuments: { idType: string; idNumber: string; idFront: string; idBack: string };
                    selectedRoomType: string;
                    roomNumber: string;
                    roomType: string;
                    messPackage: string;
                    selectedAddOns: { transport: boolean; mess: boolean; messLumpSum: boolean };
                    gender: string;
                    address: string;
                    paymentStatus: string;
                    documentVerificationStatus: string;
                    moveInStatus: string;
                };
                const completedSteps: number[] = [];

                // Infer completed steps from backend data
                // Step 1 includes: KYC docs, gender, address
                if (d.documents?.idProof) completedSteps.push(1);
                if (d.emergencyContact?.name && d.emergencyContact?.phone) completedSteps.push(2);
                if (d.selectedRoomType) completedSteps.push(3);
                // Step 4 is the review/summary step — it doesn't create new data.
                // It's considered complete if:
                //   (a) The user has filled gender + address (now saved in step 1), OR
                //   (b) Steps 1-3 are all done (review prerequisites met), OR
                //   (c) The user has already submitted a payment/deposit (onboarding progressed past step 4)
                const steps123Done = completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
                const paymentProgressed = d.paymentStatus === "pending" || d.paymentStatus === "approved"
                    || d.onboardingStatus === "completed" || d.onboardingStatus === "in-progress";
                if ((d.gender && d.address) || steps123Done || paymentProgressed) {
                    completedSteps.push(4);
                }

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

                    // Restore profile photo from backend if saved
                    if (d.documents?.photo && !prev.step1.profilePhoto) {
                        merged.step1 = {
                            ...merged.step1,
                            profilePhoto: { name: "profile-photo", preview: d.documents.photo },
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
                    if (d.selectedRoomType) {
                        try {
                            const backendRoom = fetchedRooms.find(r => r.name === d.selectedRoomType);
                            // Reverse-map backend name to frontend room ID
                            const REVERSE_ROOM_MAP: Record<string, string> = {
                                "NEXUS": "nexus-plus",
                                "COLLECTIVE": "collective-plus",
                                "AXIS": "axis",
                                "AXIS+": "studio",
                                "VIRAMAH Nexus": "nexus-plus",
                                "VIRAMAH Collective": "collective-plus",
                                "VIRAMAH Axis": "axis",
                                "VIRAMAH Axis+": "studio",
                            };
                            const discPrice = backendRoom?.pricing?.discounted ?? backendRoom?.discountedPrice ?? 0;
                            const frontendId = REVERSE_ROOM_MAP[d.selectedRoomType] || d.selectedRoomType.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const roomInfo = {
                                id: frontendId,
                                backendId: backendRoom?._id,
                                title: backendRoom?.name || d.selectedRoomType,
                                type: backendRoom?.name || d.selectedRoomType,
                                priceLabel: `₹${discPrice.toLocaleString()}`,
                            };
                            merged.step3 = {
                                ...prev.step3,
                                selectedRoom: {
                                    id: roomInfo.id,
                                    backendId: roomInfo.backendId,
                                    title: roomInfo.title,
                                    type: roomInfo.type,
                                    price: discPrice,
                                    priceLabel: roomInfo.priceLabel,
                                },
                            };
                            // Restore add-on state from messPackage
                            if (d.messPackage === "full-board") {
                                merged.step3.addOns = merged.step3.addOns.map((a) =>
                                    a.id === "lunch" ? { ...a, enabled: true } : a
                                );
                            }
                            // Restore transport add-on from backend selectedAddOns
                            if (d.selectedAddOns?.transport) {
                                merged.step3.addOns = merged.step3.addOns.map((a) =>
                                    a.id === "transport" ? { ...a, enabled: true } : a
                                );
                            }
                        } catch (e) {
                            console.error("Error processing room info:", e);
                        }
                    }

                    // AUDIT FIX S1-1: Unconditional gender & address restoration.
                    // Pre-migration users may have empty values — we MUST still initialize
                    // step1.gender and step1.address so the form fields render correctly
                    // and validation can catch missing data before confirmOnboarding.
                    merged.step1 = {
                        ...merged.step1,
                        gender: d.gender || merged.step1?.gender || "",
                        address: d.address || merged.step1?.address || "",
                    };

                    // Map backend status to frontend status (full lifecycle)
                    if (d.onboardingStatus === "completed") {
                        merged.status = "payment_submitted";
                    }
                    if (d.paymentStatus === "approved" && d.documentVerificationStatus === "pending") {
                        merged.status = "doc_verification_pending";
                    }
                    if (d.paymentStatus === "approved" && d.documentVerificationStatus === "approved" && d.moveInStatus === "not_started") {
                        merged.status = "move_in_pending";
                    }
                    if (d.paymentStatus === "approved" && d.documentVerificationStatus === "approved" && d.moveInStatus === "completed") {
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
    }, [user?._id]);

    // ── Persist to user-scoped localStorage on every state change ──
    useEffect(() => {
        if (hydrating) return;
        saveToStorage(storageKeyRef.current, state);
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

    const updateStep4 = useCallback((data: Partial<Step4Data>) => {
        setState((prev) => ({ ...prev, step4: { ...prev.step4, ...data } }));
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
        const key = storageKeyRef.current;
        if (key) {
            try { localStorage.removeItem(key); } catch { /* ignore */ }
        }
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
                updateStep4,
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
