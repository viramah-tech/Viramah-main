"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError, apiFetch } from "@/lib/api";

/**
 * New API contract: GET /api/payment/status returns user's payment history + summary.
 * Polling is useful to watch for payment approvals from admin.
 */

export interface PaymentDetail {
  _id: string;
  paymentType: "booking" | "full" | "half"; // Which category of payment
  category?: "room_rent" | "mess" | "transport";
  status: "pending" | "approved" | "rejected"; // Approval status
  amount: number;
  method?: "upi" | "bank_transfer" | "cash";
  transactionId?: string;
  proofUrl?: string;
  uploadedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface PaymentSummary {
  totalRequired: number;
  totalPaid: number;
  totalPending: number;
  paymentDeadline?: string;
  roomRent?: BackendLedger;
}

export interface V3Booking {
  status:
    | "UNDER_VERIFICATION"
    | "BOOKING_CONFIRMED"
    | "FINAL_PAYMENT_PENDING"
    | "FULLY_PAID"
    | "REJECTED"
    | "CANCELLED";
  financials?: {
    totalBookingAmount?: number;
    registrationFeePaid?: number;
    securityDepositPaid?: number;
    advanceAmount?: number;
    refundableAmount?: number;
  };
  refundRequestedAt?: string | null;
  cancellationRequestedAt?: string | null;
  extensionRequested?: boolean;
  extensionRequestedAt?: string | null;
  extensionGrantedUntil?: string | null;
}

interface BookingTimers {
  finalPaymentDeadline?: string | null;
}

interface BackendLedger {
  total?: number;
  paid?: number;
  remaining?: number;
  selectedPlan?: "pending" | "full" | "half";
  appliedDiscountValue?: number;
  fullPaymentDiscountPct?: number;
  halfPaymentDiscountPct?: number;
}

interface BackendPaymentSummary {
  registrationFee?: BackendLedger;
  securityDeposit?: BackendLedger;
  roomRent?: BackendLedger;
  messFee?: BackendLedger;
  transportFee?: BackendLedger;
  grandTotal?: BackendLedger;
  isFullyPaid?: boolean;
}

interface BackendPaymentRecord {
  paymentId?: string;
  paymentType?: "booking" | "full" | "half";
  category?: "booking" | "room_rent" | "mess" | "transport";
  status?: "pending" | "approved" | "rejected";
  method?: "upi" | "bank_transfer" | "cash";
  transactionId?: string;
  proof?: { url?: string; uploadedAt?: string };
  amounts?: { totalAmount?: number };
  paidAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface BackendPaymentDeadline {
  startedAt?: string;
  expiresAt?: string;
  extensionGrantedUntil?: string;
}

interface BackendLifecycle {
  extensionRequested?: boolean;
  extensionRequestedAt?: string | null;
  extensionGrantedUntil?: string | null;
  refundRequestedAt?: string | null;
  cancellationRequestedAt?: string | null;
}

interface BackendBookingFinancials {
  approvedBookingTotal?: number;
  registrationFeePaid?: number;
  securityDepositPaid?: number;
  advanceAmount?: number;
  refundableAmount?: number;
}

interface UseBookingStatusResult {
  payments: PaymentDetail[];
  summary: PaymentSummary | null;
  booking: V3Booking | null;
  timers: BookingTimers;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const TERMINAL_PAYMENTS = new Set(["approved", "rejected"]);
const POLL_MS = 30_000;

export function useBookingStatus(): UseBookingStatusResult {
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [booking, setBooking] = useState<V3Booking | null>(null);
  const [timers, setTimers] = useState<BookingTimers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toPaymentDetail = (p: BackendPaymentRecord, index: number): PaymentDetail => ({
    _id: p.paymentId || `payment-${index}`,
    paymentType: p.paymentType || "booking",
    category:
      p.category === "room_rent" || p.category === "mess" || p.category === "transport"
        ? p.category
        : undefined,
    status: p.status || "pending",
    amount: Number(p.amounts?.totalAmount ?? 0),
    method: p.method,
    transactionId: p.transactionId,
    proofUrl: p.proof?.url,
    uploadedAt: p.proof?.uploadedAt,
    approvedAt: p.reviewedAt,
    rejectionReason: p.rejectionReason,
  });

  const getBookingStatus = (
    records: BackendPaymentRecord[],
    paymentSummary: BackendPaymentSummary | null,
    deadline: string | null
  ): V3Booking["status"] => {
    const total = Number(paymentSummary?.grandTotal?.total ?? 0);
    const remaining = Number(paymentSummary?.grandTotal?.remaining ?? 0);
    const isFullyPaid = Boolean(paymentSummary?.isFullyPaid) || (total > 0 && remaining <= 0);
    
    const latestBooking = [...records].reverse().find((p) => p.paymentType === "booking");
    const bookingPending = records.some((p) => p.paymentType === "booking" && p.status === "pending");
    const bookingApproved = records.some((p) => p.paymentType === "booking" && p.status === "approved");
    const deadlineExpired = Boolean(deadline && new Date(deadline).getTime() < Date.now());

    if (isFullyPaid) return "FULLY_PAID";
    if (latestBooking?.status === "rejected") return "REJECTED";
    if (bookingPending) return "UNDER_VERIFICATION";
    if (bookingApproved) {
      if (deadlineExpired) return "CANCELLED";
      return "FINAL_PAYMENT_PENDING";
    }
    return "UNDER_VERIFICATION";
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch<{
        data: {
          paymentDetails: BackendPaymentRecord[];
          paymentSummary: BackendPaymentSummary;
          paymentDeadline?: BackendPaymentDeadline;
          lifecycle?: BackendLifecycle;
          bookingFinancials?: BackendBookingFinancials;
        };
      }>(
        "/api/payment/status"
      );
      const backendRecords = res?.data?.paymentDetails ?? [];
      const paymentSummary = res?.data?.paymentSummary ?? null;
      const paymentDeadline = res?.data?.paymentDeadline;
      const lifecycle = res?.data?.lifecycle ?? null;
      const bookingFinancials = res?.data?.bookingFinancials ?? null;

      const p = backendRecords.map(toPaymentDetail);
      const deadline = paymentDeadline?.extensionGrantedUntil || paymentDeadline?.expiresAt || null;

      const s: PaymentSummary = {
        totalRequired: Number(paymentSummary?.grandTotal?.total ?? 0),
        totalPaid: Number(paymentSummary?.grandTotal?.paid ?? 0),
        totalPending: p.filter((payment) => payment.status === "pending").length,
        paymentDeadline: deadline || undefined,
        roomRent: paymentSummary?.roomRent,
      };

      const latestBooking = [...backendRecords].reverse().find((record) => record.paymentType === "booking");
      const bookingAmount = Number(latestBooking?.amounts?.totalAmount ?? 0);
      const approvedBookingTotal = Number(bookingFinancials?.approvedBookingTotal ?? bookingAmount);

      const newBooking: V3Booking = {
        status: getBookingStatus(backendRecords, paymentSummary, deadline),
        financials: {
          totalBookingAmount: approvedBookingTotal,
          registrationFeePaid: Number(bookingFinancials?.registrationFeePaid ?? 0),
          securityDepositPaid: Number(bookingFinancials?.securityDepositPaid ?? 0),
          advanceAmount: Number(bookingFinancials?.advanceAmount ?? 0),
          refundableAmount: Number(bookingFinancials?.refundableAmount ?? 0),
        },
        refundRequestedAt: lifecycle?.refundRequestedAt || null,
        cancellationRequestedAt: lifecycle?.cancellationRequestedAt || null,
        extensionRequested: Boolean(lifecycle?.extensionRequested),
        extensionRequestedAt: lifecycle?.extensionRequestedAt || null,
        extensionGrantedUntil: lifecycle?.extensionGrantedUntil || null,
      };
      const newTimers: BookingTimers = { finalPaymentDeadline: deadline };

      // Only replace payments if the API returned data — never wipe existing data with an empty response.
      setPayments((prev) => (p.length > 0 ? p : prev));
      setSummary(s);
      setBooking(newBooking);
      setTimers(newTimers);
      setError(null);

      // Stop polling if all payments are in terminal state
      const allTerminal = p.length > 0 && p.every((payment) => TERMINAL_PAYMENTS.has(payment.status));
      if (allTerminal && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment status.");

      // Avoid request storms on contract mismatch/step-gate/rate-limit responses.
      if (
        err instanceof ApiError &&
        (err.status === 403 || err.status === 404 || err.status === 429)
      ) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      void fetchStatus();
    }, 0);
    intervalRef.current = setInterval(() => {
      void fetchStatus();
    }, POLL_MS);
    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  return { payments, summary, booking, timers, isLoading, error, refetch: fetchStatus };
}
