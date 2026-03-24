"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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

// ── Context ──────────────────────────────────────────────────

interface OnboardingContextType {
    state: OnboardingState;
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
}

const OnboardingContext = createContext<OnboardingContextType>({
    state: INITIAL_STATE,
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
});

// ── Provider ─────────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

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
            // Can access step N only if step N-1 is complete
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
    }, []);

    return (
        <OnboardingContext.Provider
            value={{
                state,
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
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    return useContext(OnboardingContext);
}
