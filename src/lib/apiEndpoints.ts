/**
 * Backend endpoint catalogue. Paths only — use with apiGet/apiPost/apiPut/apiPutForm.
 * Contract defined in docs/superpowers/specs/2026-04-17-viramah-backend-design.md.
 */
export const API = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  verify: {
    sendOtp: '/api/verify/send-otp',
    verifyOtp: '/api/verify/verify-otp',
  },
  onboarding: {
    compliance: '/api/onboarding/compliance',
    personal: '/api/onboarding/personal',
    guardian: '/api/onboarding/guardian',
    room: '/api/onboarding/room',
    review: '/api/onboarding/review',
    confirm: '/api/onboarding/confirm',
  },
  rooms: {
    list: '/api/rooms',
    byId: (id: string) => `/api/rooms/${id}`,
  },
  pricing: {
    get: '/api/pricing',
  },
  upload: {
    document: '/api/upload/document',
    paymentProof: '/api/upload/payment-proof',
  },
  payment: {
    booking: '/api/payment/booking',
    final: '/api/payment/final',
    status: '/api/payment/status',
    extensionRequest: '/api/payment/extension-request',
    refundRequest: '/api/payment/refund-request',
    cancelBooking: '/api/payment/cancel-booking',
  },
} as const;

/** Onboarding state machine — see backend UserSchema.onboarding.currentStep. */
export type OnboardingStep =
  | 'compliance'
  | 'verification'
  | 'personal_details'
  | 'guardian_details'
  | 'room_selection'
  | 'review'
  | 'booking_payment'
  | 'final_payment'
  | 'completed';
