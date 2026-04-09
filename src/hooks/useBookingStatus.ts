"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";

export interface BookingTimers {
  priceLockExpiry:        string | null;
  bookingPaymentExpiry:   string | null;
  finalPaymentDeadline:   string | null;
}

export interface V3Booking {
  _id: string;
  bookingId: string;
  status:
    | "DRAFT"
    | "PENDING_BOOKING_PAYMENT"
    | "UNDER_VERIFICATION"
    | "BOOKING_CONFIRMED"
    | "FINAL_PAYMENT_PENDING"
    | "PARTIALLY_PAID"
    | "FULLY_PAID"
    | "CLOSED"
    | "CANCELLED"
    | "OVERDUE"
    | "REJECTED";
  financials: {
    securityDeposit:      number; // paise
    registrationFee:      number;
    registrationGst:      number;
    totalBookingAmount:   number;
    totalPaid:            number;
    precision:            string;
  };
  timers: BookingTimers;
  createdAt: string;
}

interface UseBookingStatusResult {
  booking:   V3Booking | null;
  timers:    BookingTimers | null;
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

const TERMINAL = new Set([
  "BOOKING_CONFIRMED", "FULLY_PAID", "CLOSED", "CANCELLED",
]);
const POLL_MS = 30_000;

export function useBookingStatus(): UseBookingStatusResult {
  const [booking,   setBooking]   = useState<V3Booking | null>(null);
  const [timers,    setTimers]    = useState<BookingTimers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: { booking: V3Booking; timers: BookingTimers } }>(
        "/api/v1/bookings/my-booking"
      );
      const b = res?.data?.booking ?? null;
      const t = res?.data?.timers  ?? null;
      setBooking(b);
      setTimers(t);
      setError(null);

      if (b && TERMINAL.has(b.status) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking status.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  return { booking, timers, isLoading, error, refetch: fetchStatus };
}
