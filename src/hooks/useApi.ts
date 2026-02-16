"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Generic API hook ────────────────────────────────────────
interface UseApiOptions {
    headers?: Record<string, string>;
}

interface UseApiResult<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

export function useApi<T>(url: string | null, options?: UseApiOptions): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(!!url);

    const fetchData = useCallback(async () => {
        if (!url) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...options?.headers,
                },
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.error || "Something went wrong");
                return;
            }

            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Network error");
        } finally {
            setIsLoading(false);
        }
    }, [url, options?.headers]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, error, isLoading, refetch: fetchData };
}

// ─── Rooms API ───────────────────────────────────────────────
interface Room {
    id: string;
    propertyId: string;
    roomNumber: string;
    type: string;
    floor: number;
    basePrice: number;
    status: string;
    currentOccupancy: number;
    maxOccupancy: number;
    description: string;
    images: string[];
    createdAt: string;
    property?: {
        name: string;
        city: string;
        state: string;
    };
}

interface RoomsResponse {
    data: Room[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface UseRoomsFilters {
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

export function useRooms(filters?: UseRoomsFilters) {
    const params = new URLSearchParams();
    if (filters?.city) params.set("city", filters.city);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.minPrice) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const url = `/api/v1/rooms${queryString ? `?${queryString}` : ""}`;

    return useApi<RoomsResponse>(url);
}

// ─── Authenticated API helper ────────────────────────────────
import { supabase } from "@/lib/supabase";

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return {};
    return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiPost<T>(url: string, body: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(body),
        });

        const json = await response.json();

        if (!response.ok) {
            return { data: null, error: json.error || "Request failed" };
        }

        return { data: json, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : "Network error" };
    }
}

export async function apiGet<T>(url: string): Promise<{ data: T | null; error: string | null }> {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            headers: { "Content-Type": "application/json", ...headers },
        });

        const json = await response.json();

        if (!response.ok) {
            return { data: null, error: json.error || "Request failed" };
        }

        return { data: json, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : "Network error" };
    }
}

// ─── Wallet API ──────────────────────────────────────────────
interface WalletResponse {
    balance: number;
    transactions: Array<{
        id: string;
        type: "credit" | "debit";
        amount: number;
        balanceAfter: number;
        source: string;
        description: string;
        createdAt: string;
    }>;
}

export function useWallet() {
    const [data, setData] = useState<WalletResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWallet = useCallback(async () => {
        setIsLoading(true);
        const result = await apiGet<WalletResponse>("/api/v1/student/wallet");
        if (result.error) {
            setError(result.error);
        } else {
            setData(result.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    return { data, isLoading, error, refetch: fetchWallet };
}

// ─── Bookings API ────────────────────────────────────────────
interface Booking {
    id: string;
    roomId: string;
    status: string;
    checkInDate: string;
    checkOutDate: string | null;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
}

interface BookingsResponse {
    data: Booking[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useBookings() {
    const [data, setData] = useState<BookingsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        const result = await apiGet<BookingsResponse>("/api/v1/bookings");
        if (result.error) {
            setError(result.error);
        } else {
            setData(result.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return { data, isLoading, error, refetch: fetchBookings };
}
