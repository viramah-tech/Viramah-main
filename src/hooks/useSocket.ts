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
    onEventRef.current = onEvent;

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
