"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import type { OnboardingStep } from "@/lib/apiEndpoints";

// ── Form state shapes (UI-only; backend types live in AuthContext) ──────────

export interface UploadedFile {
    /** Display name — usually the original filename. */
    name: string;
    /** Base64 data URL or an already-uploaded remote URL. */
    preview: string;
    /** When true, `preview` is a remote URL (no need to re-upload). */
    remote?: boolean;
}

export interface PersonalForm {
    fullName: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other" | "";
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    idType: "aadhaar" | "pan" | "passport" | "driving_license" | "voter_id" | "";
    idNumber: string;
    idFront: UploadedFile | null;
    idBack: UploadedFile | null;
    profilePhoto: UploadedFile | null;
}

export interface GuardianForm {
    fullName: string;
    relation: string;
    phone: string;
    alternatePhone: string;
    idType: PersonalForm["idType"];
    idNumber: string;
    idFront: UploadedFile | null;
    idBack: UploadedFile | null;
}

export interface RoomForm {
    /** Mongo ObjectId of the selected RoomType. */
    roomTypeId: string;
    includeMess: boolean;
    includeTransport: boolean;
}

export interface PaymentForm {
    method: "upi" | "bank_transfer" | "cash" | "";
    transactionId: string;
    amount: number;
    proof: UploadedFile | null;
}

// ── Step → path routing ─────────────────────────────────────────────────────

/** Maps an onboarding step to the UI path that handles it. */
export const STEP_TO_PATH: Record<OnboardingStep, string> = {
    compliance: "/user-onboarding/terms",
    verification: "/verify-contact", // Email + phone verification
    personal_details: "/user-onboarding/step-1",
    guardian_details: "/user-onboarding/step-2",
    room_selection: "/user-onboarding/step-3",
    review: "/user-onboarding/step-4",
    booking_payment: "/user-onboarding/deposit",
    final_payment: "/user-onboarding/payment-breakdown",
    completed: "/student/dashboard",
};

const STEP_ORDER: OnboardingStep[] = [
    "compliance",
    "verification",
    "personal_details",
    "guardian_details",
    "room_selection",
    "review",
    "booking_payment",
    "final_payment",
    "completed",
];

/** Rank of an onboarding step in the state machine (0-based). */
export function stepIndex(step: OnboardingStep): number {
    return STEP_ORDER.indexOf(step);
}

// ── Initial form state ──────────────────────────────────────────────────────

const EMPTY_PERSONAL: PersonalForm = {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    idType: "aadhaar",
    idNumber: "",
    idFront: null,
    idBack: null,
    profilePhoto: null,
};

const EMPTY_GUARDIAN: GuardianForm = {
    fullName: "",
    relation: "",
    phone: "",
    alternatePhone: "",
    idType: "aadhaar",
    idNumber: "",
    idFront: null,
    idBack: null,
};

const EMPTY_ROOM: RoomForm = {
    roomTypeId: "",
    includeMess: false,
    includeTransport: false,
};

const EMPTY_PAYMENT: PaymentForm = {
    method: "",
    transactionId: "",
    amount: 0,
    proof: null,
};

// ── Context ─────────────────────────────────────────────────────────────────

interface OnboardingContextType {
    currentStep: OnboardingStep;
    personal: PersonalForm;
    guardian: GuardianForm;
    room: RoomForm;
    payment: PaymentForm;
    setPersonal: (patch: Partial<PersonalForm>) => void;
    setGuardian: (patch: Partial<GuardianForm>) => void;
    setRoom: (patch: Partial<RoomForm>) => void;
    setPayment: (patch: Partial<PaymentForm>) => void;
    reset: () => void;
    /** True if `target` is reachable given the user's current step. */
    canAccessStep: (target: OnboardingStep) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const currentStep: OnboardingStep = user?.onboarding?.currentStep ?? "compliance";

    const [personal, setPersonalState] = useState<PersonalForm>(() => seedPersonal(user));
    const [guardian, setGuardianState] = useState<GuardianForm>(() => seedGuardian(user));
    const [room, setRoomState] = useState<RoomForm>(() => seedRoom(user));
    const [payment, setPaymentState] = useState<PaymentForm>(EMPTY_PAYMENT);
    const [seeded, setSeeded] = useState(!!user);

    // Re-hydrate form state once the user object loads (it's null during auth init).
    useEffect(() => {
        if (user && !seeded) {
            // Hydrate local editable form state from auth user once on load.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPersonalState(seedPersonal(user));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGuardianState(seedGuardian(user));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRoomState(seedRoom(user));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSeeded(true);
        }
    }, [user, seeded]);

    const setPersonal = useCallback(
        (patch: Partial<PersonalForm>) => setPersonalState((p) => ({ ...p, ...patch })),
        []
    );
    const setGuardian = useCallback(
        (patch: Partial<GuardianForm>) => setGuardianState((p) => ({ ...p, ...patch })),
        []
    );
    const setRoom = useCallback(
        (patch: Partial<RoomForm>) => setRoomState((p) => ({ ...p, ...patch })),
        []
    );
    const setPayment = useCallback(
        (patch: Partial<PaymentForm>) => setPaymentState((p) => ({ ...p, ...patch })),
        []
    );
    const reset = useCallback(() => {
        setPersonalState(EMPTY_PERSONAL);
        setGuardianState(EMPTY_GUARDIAN);
        setRoomState(EMPTY_ROOM);
        setPaymentState(EMPTY_PAYMENT);
    }, []);

    const canAccessStep = useCallback(
        (target: OnboardingStep) => true, // Allow free movement through all steps
        [currentStep]
    );

    const value = useMemo(
        () => ({
            currentStep,
            personal,
            guardian,
            room,
            payment,
            setPersonal,
            setGuardian,
            setRoom,
            setPayment,
            reset,
            canAccessStep,
        }),
        [
            currentStep,
            personal,
            guardian,
            room,
            payment,
            setPersonal,
            setGuardian,
            setRoom,
            setPayment,
            reset,
            canAccessStep,
        ]
    );

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
    const ctx = useContext(OnboardingContext);
    if (!ctx) throw new Error("useOnboarding must be used within an OnboardingProvider");
    return ctx;
}

// ── Seeding from the User document ──────────────────────────────────────────

type MaybeUser = ReturnType<typeof useAuth>["user"];

function seedPersonal(user: MaybeUser): PersonalForm {
    if (!user) return EMPTY_PERSONAL;
    const proof = user.userIdProof || {};
    return {
        fullName: user.basicInfo.fullName || "",
        dateOfBirth: user.basicInfo.dateOfBirth ? String(user.basicInfo.dateOfBirth).slice(0, 10) : "",
        gender: (user.basicInfo.gender as PersonalForm["gender"]) || "",
        // Backend stores address as a plain string; pre-fill addressLine1 with it.
        addressLine1: typeof user.basicInfo.address === "string" ? user.basicInfo.address : "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        idType: (proof.idType as PersonalForm["idType"]) || "aadhaar",
        idNumber: proof.idNumber || "",
        idFront: proof.frontImage ? { name: "id-front", preview: proof.frontImage, remote: true } : null,
        idBack: proof.backImage ? { name: "id-back", preview: proof.backImage, remote: true } : null,
        profilePhoto: user.profilePhoto?.url
            ? { name: "profile-photo", preview: user.profilePhoto.url, remote: true }
            : null,
    };
}

function seedGuardian(user: MaybeUser): GuardianForm {
    if (!user || !user.guardianDetails) return EMPTY_GUARDIAN;
    const g = user.guardianDetails;
    const proof = g.idProof || {};
    return {
        fullName: g.fullName || "",
        relation: g.relation || "",
        phone: g.phone || "",
        alternatePhone: g.alternatePhone || "",
        idType: (proof.idType as GuardianForm["idType"]) || "aadhaar",
        idNumber: proof.idNumber || "",
        idFront: proof.frontImage
            ? { name: "guardian-id-front", preview: proof.frontImage, remote: true }
            : null,
        idBack: proof.backImage
            ? { name: "guardian-id-back", preview: proof.backImage, remote: true }
            : null,
    };
}

function seedRoom(user: MaybeUser): RoomForm {
    if (!user || !user.roomDetails) return EMPTY_ROOM;
    const r = user.roomDetails;
    return {
        roomTypeId: typeof r.roomType === "string" ? r.roomType : "",
        includeMess: !!r.includeMess,
        includeTransport: !!r.includeTransport,
    };
}
