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

// ── Server status shape ──────────────────────────────────────

interface ServerOnboardingStatus {
    // New server-authoritative fields
    currentStep: number | 'completed';
    nextAllowedStep: number | null;
    completedSteps: number[];
    canProceed: boolean;
    display: {
        progressPercent: number;
        stepLabel: string;
    };

    // Existing fields (for form pre-fill)
    onboardingStatus: string;
    name?: string;
    dateOfBirth?: string;
    idType?: string;
    idNumber?: string;
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
    parentDocuments?: {
        idType?: string;
        idNumber?: string;
        idFront?: string;
        idBack?: string;
    };
    selectedRoomType?: string;
    roomTypeId?: string;
    messPackage?: string;
    selectedAddOns?: { transport: boolean; mess: boolean; messLumpSum: boolean };
    gender?: string;
    address?: string;
    paymentStatus?: string;
    documentVerificationStatus?: string;
    moveInStatus?: string;
}

// ── Legacy state shape (backward compat for consumers) ──────

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

// ── Context ──────────────────────────────────────────────────

interface OnboardingContextType {
    // ── NEW: Server-authoritative state ──────────────────────
    serverStatus: ServerOnboardingStatus | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;

    // ── LEGACY: Backward-compatible API (consumers still use these) ──
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
    serverStatus: null,
    loading: true,
    error: null,
    refresh: async () => {},
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

// ── Helpers: build legacy state from server response ─────────

function buildStateFromServer(d: ServerOnboardingStatus): OnboardingState {
    const state = { ...INITIAL_STATE };

    // Step 1: KYC
    state.step1 = {
        ...state.step1,
        fullName: d.name || "",
        dateOfBirth: d.dateOfBirth ? String(d.dateOfBirth).split("T")[0] : "",
        idType: d.idType || "aadhaar",
        idNumber: d.idNumber || "",
        gender: d.gender || "",
        address: d.address || "",
    };
    if (d.documents?.photo) state.step1.profilePhoto = { name: "photo", preview: d.documents.photo };
    if (d.documents?.idProof) state.step1.idFront = { name: "id-front", preview: d.documents.idProof };
    if (d.documents?.addressProof) state.step1.idBack = { name: "id-back", preview: d.documents.addressProof };

    // Step 2: Emergency
    if (d.emergencyContact?.name) {
        state.step2 = {
            ...state.step2,
            emergencyName: d.emergencyContact.name,
            emergencyPhone: d.emergencyContact.phone || "",
            emergencyRelation: d.emergencyContact.relation || "",
            alternatePhone: d.emergencyContact.alternatePhone || "",
        };
    }
    if (d.parentDocuments) {
        state.step2.parentIdType = d.parentDocuments.idType || "aadhaar";
        state.step2.parentIdNumber = d.parentDocuments.idNumber || "";
        if (d.parentDocuments.idFront) state.step2.parentIdFront = { name: "parent-id-front", preview: d.parentDocuments.idFront };
        if (d.parentDocuments.idBack) state.step2.parentIdBack = { name: "parent-id-back", preview: d.parentDocuments.idBack };
    }

    // Step 3: Room
    if (d.selectedRoomType) {
        state.step3.selectedRoom = {
            id: d.selectedRoomType.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            backendId: d.roomTypeId || undefined,
            title: d.selectedRoomType,
            type: d.selectedRoomType,
            price: 0,
            priceLabel: "",
        };
    }
    if (d.selectedAddOns) {
        state.step3.addOns = DEFAULT_ADD_ONS.map(a => ({
            ...a,
            enabled: a.id === "transport" ? !!d.selectedAddOns?.transport : a.id === "lunch" ? !!d.selectedAddOns?.mess : false,
        }));
    }

    // Completed steps come from server now
    state.completedSteps = d.completedSteps || [];

    // Derive legacy status
    if (d.onboardingStatus === "completed") state.status = "payment_submitted";
    if (d.paymentStatus === "approved") {
        if (d.documentVerificationStatus === "pending") state.status = "doc_verification_pending";
        else if (d.moveInStatus === "not_started") state.status = "move_in_pending";
        else if (d.moveInStatus === "completed") state.status = "move_in_approved";
    }

    return state;
}

// ── Provider ─────────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: ReactNode }) {
    // Server state (source of truth)
    const [serverStatus, setServerStatus] = useState<ServerOnboardingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Legacy state (derived from server, with local overrides for form input)
    const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
    const [saving, setSaving] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const { user } = useAuth();

    // ── Server fetch (the ONLY data source) ──────────────────
    const refresh = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        setLoading(true);
        try {
            const res = await apiFetch<{ data: ServerOnboardingStatus }>(
                PUBLIC_API.onboarding.status,
                { method: 'GET' }
            );
            if (ac.signal.aborted) return;
            const d = res.data;
            setServerStatus(d);
            setState(prev => ({
                ...buildStateFromServer(d),
                // Preserve ephemeral local edits (bookingId, payment form state)
                bookingId: prev.bookingId,
                bookingStatus: prev.bookingStatus,
                payment: prev.payment.method ? prev.payment : INITIAL_STATE.payment,
            }));
            setError(null);
        } catch (e) {
            if (ac.signal.aborted) return;
            setError(e instanceof Error ? e.message : 'Failed to load status');
        } finally {
            if (!ac.signal.aborted) setLoading(false);
        }
    }, []);

    // Hydrate on mount when user is available
    useEffect(() => {
        if (!user?._id) {
            setLoading(false);
            return;
        }
        refresh();
    }, [user?._id, refresh]);

    // ── Legacy step update helpers (ephemeral form input only) ──

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

    // markStepComplete is now a no-op — server derives completion from field presence
    const markStepComplete = useCallback((_step: number) => {
        // Server is source of truth; call refresh() after saving to get updated completedSteps
    }, []);

    const isStepComplete = useCallback(
        (step: number) => state.completedSteps.includes(step),
        [state.completedSteps]
    );

    // canAccessStep now reads from server-derived completedSteps
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
        setServerStatus(null);
    }, []);

    // ── Save step to backend, then refresh server state ────────
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
                // Refresh from server to get updated completedSteps, currentStep, etc.
                await refresh();
            } finally {
                setSaving(false);
            }
        },
        [refresh]
    );

    return (
        <OnboardingContext.Provider
            value={{
                serverStatus,
                loading,
                error,
                refresh,
                state,
                hydrating: loading,
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
