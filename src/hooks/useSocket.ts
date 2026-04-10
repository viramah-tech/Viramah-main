"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useSocket(
    userMongoId: string | undefined,
    onEvent?: (event: string, data: unknown) => void
) {
    const socketRef = useRef<Socket | null>(null);
    const onEventRef = useRef(onEvent);
    
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            // Join user-specific room for targeted updates
            if (userMongoId) {
                socket.emit("join:user", userMongoId);
            }
        });

        socket.on("user:updated", (data: unknown) => {
            onEventRef.current?.("user:updated", data);
        });

        socket.on("payment:updated", (data: unknown) => {
            onEventRef.current?.("payment:updated", data);
        });

        // V2 payment lifecycle events (Plan Section 7)
        socket.on("payment:approved", (data: unknown) => {
            onEventRef.current?.("payment:approved", data);
        });
        socket.on("payment:rejected", (data: unknown) => {
            onEventRef.current?.("payment:rejected", data);
        });
        socket.on("payment:phase2_unlocked", (data: unknown) => {
            onEventRef.current?.("payment:phase2_unlocked", data);
        });
        socket.on("payment:on_hold", (data: unknown) => {
            onEventRef.current?.("payment:on_hold", data);
        });
        socket.on("discount:updated", (data: unknown) => {
            onEventRef.current?.("discount:updated", data);
        });
        socket.on("discount:override_set", (data: unknown) => {
            onEventRef.current?.("discount:override_set", data);
        });
        socket.on("payment:submitted", (data: unknown) => {
            onEventRef.current?.("payment:submitted", data);
        });

        socket.on("disconnect", () => {
            // noop
        });

        return () => {
            socket.disconnect();
        };
    }, [userMongoId]);

    const emit = useCallback((event: string, data?: unknown) => {
        socketRef.current?.emit(event, data);
    }, []);

    return { emit };
}
