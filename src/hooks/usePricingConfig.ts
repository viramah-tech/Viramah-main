/**
 * AUDIT FIX D-1: Shared hook to fetch pricing constants from server.
 * All monetary amounts must come from PricingConfig — no hardcoded values.
 *
 * Features:
 * - Module-level cache with TTL (5 min) — prevents duplicate network requests
 * - Graceful fallback to known-good defaults if API fails (UI never blocks)
 * - Cache busting via refetch() for admin config changes
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface PricingConfig {
    tenureMonths: number;
    securityDeposit: number;
    registrationFee: number;
    transportMonthly: number;
    messMonthly: number;
    messLumpSum: number;
    bookingMinimumAmount: number;
    bookingSuggestedAmount: number;
    paymentDeadlineDays: number;
}

// Fallback values — only used if API fails.
// These match current PricingConfig seed defaults.
const FALLBACK_PRICING: PricingConfig = {
    tenureMonths: 11,
    securityDeposit: 15000,
    registrationFee: 1000,
    transportMonthly: 2000,
    messMonthly: 2000,
    messLumpSum: 19900,
    bookingMinimumAmount: 1000,
    bookingSuggestedAmount: 16000,
    paymentDeadlineDays: 30,
};

// Module-level cache (shared across all component instances)
let cachedConfig: PricingConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const readNumber = (...values: unknown[]) => {
    for (const value of values) {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
    }
    return undefined;
};

const normalizePricing = (raw: unknown): PricingConfig => {
    const source = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};
    const mess = (source.mess && typeof source.mess === 'object')
        ? (source.mess as Record<string, unknown>)
        : {};
    const transport = (source.transport && typeof source.transport === 'object')
        ? (source.transport as Record<string, unknown>)
        : {};
    const bookingPayment = (source.bookingPayment && typeof source.bookingPayment === 'object')
        ? (source.bookingPayment as Record<string, unknown>)
        : {};

    const tenureMonths = readNumber(source.tenureMonths) ?? FALLBACK_PRICING.tenureMonths;
    const securityDeposit = readNumber(source.securityDeposit) ?? FALLBACK_PRICING.securityDeposit;
    const registrationFee = readNumber(source.registrationFee) ?? FALLBACK_PRICING.registrationFee;

    return {
        tenureMonths,
        securityDeposit,
        registrationFee,
        transportMonthly:
            readNumber(source.transportMonthly, transport.monthlyFee) ??
            FALLBACK_PRICING.transportMonthly,
        messMonthly:
            readNumber(source.messMonthly, mess.monthlyFee) ??
            FALLBACK_PRICING.messMonthly,
        messLumpSum:
            readNumber(source.messLumpSum, mess.annualDiscountedPrice) ??
            FALLBACK_PRICING.messLumpSum,
        bookingMinimumAmount:
            readNumber(source.bookingMinimumAmount, bookingPayment.minimumAmount) ??
            FALLBACK_PRICING.bookingMinimumAmount,
        bookingSuggestedAmount:
            readNumber(source.bookingSuggestedAmount, bookingPayment.suggestedAmount) ??
            FALLBACK_PRICING.bookingSuggestedAmount,
        paymentDeadlineDays:
            readNumber(source.paymentDeadlineDays) ??
            FALLBACK_PRICING.paymentDeadlineDays,
    };
};

export function usePricingConfig() {
    const [config, setConfig] = useState<PricingConfig>(
        cachedConfig ?? FALLBACK_PRICING
    );
    const [loading, setLoading] = useState(!cachedConfig);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
            setConfig(cachedConfig);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<{ data?: unknown }>(
                '/api/pricing'
            );
            const payload = (res?.data as { pricing?: unknown } | undefined)?.pricing ?? res?.data;
            if (payload) {
                const nextConfig = normalizePricing(payload);
                cachedConfig = nextConfig;
                cacheTimestamp = Date.now();
                setConfig(nextConfig);
            } else {
                setError('Using default pricing. Some values may be outdated.');
            }
        } catch {
            setError('Using default pricing. Some values may be outdated.');
            // Keep FALLBACK_PRICING — do not block UI
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initialFetchTimer = setTimeout(() => {
            void fetchConfig();
        }, 0);

        return () => {
            clearTimeout(initialFetchTimer);
        };
    }, [fetchConfig]);

    return { config, loading, error, refetch: () => fetchConfig(true) };
}
