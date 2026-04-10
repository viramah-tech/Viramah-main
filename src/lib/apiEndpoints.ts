export const PUBLIC_API = {
  auth: {
    login: "/api/public/auth/login",
    register: "/api/public/auth/register",
    logout: "/api/public/auth/logout",
    me: "/api/public/auth/me",
  },
  onboarding: {
    status: "/api/public/onboarding/status",
    confirm: "/api/public/onboarding/confirm",
    step: (step: 1 | 2 | 3 | 4) => `/api/public/onboarding/step-${step}`,
  },
  rooms: {
    list: "/api/public/rooms",
  },
  deposits: {
    status: "/api/public/deposits/status",
    initiate: "/api/public/deposits/initiate",
    requestRefund: "/api/public/deposits/request-refund",
  },
  upload: {
    document: "/api/public/upload/document",
    photo: "/api/public/upload/photo",
    receipt: "/api/public/upload/receipt",
    file: "/api/public/upload/file",
  },
} as const;

export const V1_API = {
  bookings: {
    base: "/api/v1/bookings",
    myBooking: "/api/v1/bookings/my-booking",
    byId: (id: string) => `/api/v1/bookings/${id}`,
    bills: (id: string) => `/api/v1/bookings/${id}/bills`,
    timer: (id: string) => `/api/v1/bookings/${id}/timer`,
    pay: (id: string) => `/api/v1/bookings/${id}/pay`,
    selectTrack: (id: string) => `/api/v1/bookings/${id}/select-track`,
    paymentPage: (id: string) => `/api/v1/bookings/${id}/payment-page`,
    installment: (id: string, installmentNumber: number) => `/api/v1/bookings/${id}/installments/${installmentNumber}`,
    installmentPay: (id: string, installmentNumber: number) => `/api/v1/bookings/${id}/installments/${installmentNumber}/pay`,
    services: (id: string) => `/api/v1/bookings/${id}/services`,
    servicePay: (id: string, serviceType: string) => `/api/v1/bookings/${id}/services/${serviceType}/pay`,
  },
} as const;
