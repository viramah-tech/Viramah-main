"use client";

import {
    createContext, useContext, useState, useCallback, useEffect, useRef,
    ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import { PUBLIC_API } from "@/lib/apiEndpoints";
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

export type Step4Data = Record<string, unknown>;

interface OnboardingStatusApiData {
    name?: string;
    idType?: string;
    idNumber?: string;
    dateOfBirth?: string;
    documents?: {
        photo?: string;
        idProof?: string;
        addressProof?: string;
    };
    emergencyContact?: {
        name?: string;
        phone?: string;
        relation?: string;
        alternatePhone?: string;
    };
    selectedRoomType?: string;
    paymentStatus?: string;
    onboardingStatus?: string;
    documentVerificationStatus?: string;
    moveInStatus?: string;
    gender?: string;
    address?: string;
}

interface RoomApiRecord {
    _id: string;
    name: string;
    pricing?: {
        discounted?: number;
    };
    discountedPrice?: number;
}

interface OnboardingStatusResponse {
    data: OnboardingStatusApiData;
}

interface RoomsResponse {
    data: {
        roomTypes: RoomApiRecord[];
    };
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
    bookingId: string | null;
    bookingStatus: string | null;
}

// ── Defaults ─────────────────────────────────────────────────

const DEFAULT_ADD_ONS: AddOnService[] = [
    { id: "transport", name: "Daily Transport", price: 2000, enabled: false },
    { id: "lunch", name: "Mess Amount", price: 2200, enabled: false },
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
    bookingId: null,
    bookingStatus: null,
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
    setBookingId: (id: string) => void;
    setBookingStatus: (status: string) => void;
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
    setBookingId: () => {},
    setBookingStatus: () => {},
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
                step3: { 
                    ...INITIAL_STATE.step3, 
                    ...cached.step3,
                    addOns: cached.step3?.addOns?.map(cachedAddon => {
                        const defaultMatch = DEFAULT_ADD_ONS.find(da => da.id === cachedAddon.id);
                        return defaultMatch 
                            ? { ...cachedAddon, price: defaultMatch.price, name: defaultMatch.name }
                            : cachedAddon;
                    }) || DEFAULT_ADD_ONS,
                },
                step4: { ...INITIAL_STATE.step4, ...cached.step4 },
                payment: { ...INITIAL_STATE.payment, ...cached.payment },
            });
        }

        // 2. Attempt backend hydration (async, best-effort)
        (async () => {
            try {
                // Fetch status and rooms
                const statusRes = await apiFetch<OnboardingStatusResponse>(PUBLIC_API.onboarding.status);
                const d = statusRes.data;

                let fetchedRooms: RoomApiRecord[] = [];
                try {
                    const roomsRes = await apiFetch<RoomsResponse>(PUBLIC_API.rooms.list);
                    fetchedRooms = roomsRes.data?.roomTypes || [];
                } catch (e) {
                    console.error("Failed to fetch rooms during hydration:", e);
                }

                const completedSteps: number[] = [];
                if (d.documents?.idProof) completedSteps.push(1);
                if (d.emergencyContact?.name && d.emergencyContact?.phone) completedSteps.push(2);
                if (d.selectedRoomType) completedSteps.push(3);

                const steps123Done = completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
                const paymentProgressed = d.paymentStatus === "pending" || d.paymentStatus === "approved"
                    || d.onboardingStatus === "completed" || d.onboardingStatus === "in-progress";
                if ((d.gender && d.address) || steps123Done || paymentProgressed) {
                    completedSteps.push(4);
                }

                setState((prev) => {
                    const merged: OnboardingState = {
                        ...prev,
                        completedSteps: [...new Set([...prev.completedSteps, ...completedSteps])],
                    };

                    // Step 1: KYC
                    if (d.name || d.idNumber) {
                        merged.step1 = {
                            ...merged.step1,
                            fullName: d.name || merged.step1.fullName,
                            dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split("T")[0] : merged.step1.dateOfBirth,
                            idType: d.idType || merged.step1.idType,
                            idNumber: d.idNumber || merged.step1.idNumber,
                        };
                    }
                    if (d.documents?.photo) merged.step1.profilePhoto = { name: "photo", preview: d.documents.photo };
                    if (d.documents?.idProof) merged.step1.idFront = { name: "id-front", preview: d.documents.idProof };
                    if (d.documents?.addressProof) merged.step1.idBack = { name: "id-back", preview: d.documents.addressProof };
                    merged.step1.gender = d.gender || merged.step1.gender || "";
                    merged.step1.address = d.address || merged.step1.address || "";

                    // Step 2: Emergency
                    if (d.emergencyContact?.name) {
                        merged.step2 = {
                            ...merged.step2,
                            emergencyName: d.emergencyContact.name,
                            emergencyPhone: d.emergencyContact.phone || merged.step2.emergencyPhone,
                            emergencyRelation: d.emergencyContact.relation || merged.step2.emergencyRelation,
                            alternatePhone: d.emergencyContact.alternatePhone || "",
                        };
                    }

                    // Step 3: Room
                    if (d.selectedRoomType) {
                        const REVERSE_ROOM_MAP: Record<string, string> = {
                            "NEXUS": "nexus-plus", "COLLECTIVE": "collective-plus", "AXIS": "axis", "AXIS+": "studio",
                            "VIRAMAH Nexus": "nexus-plus", "VIRAMAH Collective": "collective-plus",
                            "VIRAMAH Axis": "axis", "VIRAMAH Axis+": "studio"
                        };
                        const backendRoom = fetchedRooms.find(r => r.name === d.selectedRoomType);
                        const discPrice = backendRoom?.pricing?.discounted ?? backendRoom?.discountedPrice ?? 0;
                        const frontendId = REVERSE_ROOM_MAP[d.selectedRoomType] || d.selectedRoomType.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        
                        merged.step3 = {
                            ...merged.step3,
                            selectedRoom: {
                                id: frontendId,
                                backendId: backendRoom?._id || merged.step3.selectedRoom?.backendId,
                                title: backendRoom?.name || d.selectedRoomType,
                                type: backendRoom?.name || d.selectedRoomType,
                                price: discPrice || merged.step3.selectedRoom?.price || 0,
                                priceLabel: `₹${(discPrice || merged.step3.selectedRoom?.price || 0).toLocaleString()}`,
                            }
                        };
                    }

                    // Status
                    if (d.onboardingStatus === "completed") merged.status = "payment_submitted";
                    if (d.paymentStatus === "approved") {
                        if (d.documentVerificationStatus === "pending") merged.status = "doc_verification_pending";
                        else if (d.moveInStatus === "not_started") merged.status = "move_in_pending";
                        else if (d.moveInStatus === "completed") merged.status = "move_in_approved";
                    }

                    return merged;
                });
            } catch (err) {
                console.error("Backend hydration failed:", err);
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

    const setBookingId = useCallback((id: string) => {
        setState(prev => ({ ...prev, bookingId: id }));
    }, []);

    const setBookingStatus = useCallback((status: string) => {
        setState(prev => ({ ...prev, bookingStatus: status }));
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
                        ? PUBLIC_API.onboarding.confirm
                        : PUBLIC_API.onboarding.step(step as 1 | 2 | 3 | 4);

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
                setBookingId,
                setBookingStatus,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    return useContext(OnboardingContext);
}
