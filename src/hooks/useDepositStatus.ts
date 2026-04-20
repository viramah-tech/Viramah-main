"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";

export interface RoomHold {
  _id: string;
  userId: string;
  roomTypeId: { _id: string; name: string; displayName?: string } | string;
  depositAmount: number;
  registrationFeePaid?: number;
  advanceAmount?: number;
  totalPaidAtDeposit?: number;
  status: "pending_approval" | "active" | "converted" | "refunded" | "expired";
  depositPaidAt?: string;
  refundDeadline?: string;
  paymentDeadline?: string;
  refundRequestedAt?: string;
  createdAt: string;
  // Computed by server
  daysUntilRefundDeadline?: number | null;
  daysUntilPaymentDeadline?: number | null;
  isRefundEligible?: boolean;
  isPaymentWindowOpen?: boolean;
}

interface UseDepositStatusResult {
  hold: RoomHold | null;
  isRefundEligible: boolean;
  isPaymentWindowOpen: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Statuses where we should stop polling (terminal states). */
const TERMINAL_STATUSES = new Set(["converted", "refunded", "expired"]);
const POLL_INTERVAL_MS = 30_000;

export function useDepositStatus(): UseDepositStatusResult {
  const [hold, setHold] = useState<RoomHold | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: { paymentDetails: RoomHold[] | null } }>(
        "/api/payment/status"
      );
      const fetchedHold = res?.data?.hold ?? null;
      setHold(fetchedHold);
      setError(null);

      // Stop polling if terminal status reached
      if (fetchedHold && TERMINAL_STATUSES.has(fetchedHold.status)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deposit status.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + poll setup
  useEffect(() => {
    const initialFetchTimer = setTimeout(() => {
      void fetchStatus();
    }, 0);
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initialFetchTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  return {
    hold,
    isRefundEligible: hold?.isRefundEligible ?? false,
    isPaymentWindowOpen: hold?.isPaymentWindowOpen ?? false,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
