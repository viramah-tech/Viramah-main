"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from "lucide-react";

type ToastType = "error" | "success" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "error", duration = 5000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ── Internal Toast Container ────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    return (
        <div
            style={{
                position: "fixed",
                top: 20,
                right: 20,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxWidth: 420,
                width: "calc(100vw - 40px)",
                pointerEvents: "none",
            }}
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: typeof AlertCircle }> = {
    error: {
        bg: "rgba(192, 57, 43, 0.08)",
        border: "rgba(192, 57, 43, 0.25)",
        color: "#c0392b",
        icon: AlertCircle,
    },
    success: {
        bg: "rgba(46, 107, 79, 0.08)",
        border: "rgba(46, 107, 79, 0.25)",
        color: "#1A5E3A",
        icon: CheckCircle,
    },
    warning: {
        bg: "rgba(217, 180, 74, 0.1)",
        border: "rgba(217, 180, 74, 0.3)",
        color: "#92700E",
        icon: AlertTriangle,
    },
    info: {
        bg: "rgba(31, 58, 45, 0.06)",
        border: "rgba(31, 58, 45, 0.15)",
        color: "#1F3A2D",
        icon: Info,
    },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const style = TOAST_STYLES[toast.type];
    const Icon = style.icon;

    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            style={{
                background: "#FFFFFF",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${style.border}`,
                borderLeft: `4px solid ${style.color}`,
                borderRadius: 12,
                padding: "14px 16px",
                boxShadow: "0 8px 32px rgba(46, 42, 38, 0.12), 0 2px 8px rgba(46, 42, 38, 0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                pointerEvents: "auto",
                cursor: "pointer",
            }}
            onClick={() => onRemove(toast.id)}
            role="alert"
        >
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: style.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                }}
            >
                <Icon size={14} color={style.color} strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        fontFamily: "var(--font-body, sans-serif)",
                        fontSize: "0.88rem",
                        color: style.color,
                        fontWeight: 500,
                        lineHeight: 1.45,
                        margin: 0,
                        wordBreak: "break-word",
                    }}
                >
                    {toast.message}
                </p>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(toast.id);
                }}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(46,42,38,0.3)",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    transition: "color 0.2s ease",
                }}
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}
