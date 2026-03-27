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
    securityDeposit: number;
    registrationFee: number;
    totalDepositPayment: number;
    transportMonthly: number;
    messMonthly: number;
    messLumpSum: number;
    discountFull: number;
    discountHalf: number;
    referralBonus: number;
    tenureMonths: number;
    gstRate: number;
}

// Fallback values — only used if API fails.
// These match current PricingConfig seed defaults.
const FALLBACK_PRICING: PricingConfig = {
    securityDeposit: 15000,
    registrationFee: 1000,
    totalDepositPayment: 16000,
    transportMonthly: 2000,
    messMonthly: 2000,
    messLumpSum: 19900,
    discountFull: 0.40,
    discountHalf: 0.25,
    referralBonus: 1000,
    tenureMonths: 11,
    gstRate: 0.12,
};

// Module-level cache (shared across all component instances)
let cachedConfig: PricingConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
            const res = await apiFetch<{ data: PricingConfig }>(
                '/api/public/payments/pricing-config'
            );
            if (res?.data) {
                cachedConfig = res.data;
                cacheTimestamp = Date.now();
                setConfig(res.data);
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
        fetchConfig();
    }, [fetchConfig]);

    return { config, loading, error, refetch: () => fetchConfig(true) };
}
