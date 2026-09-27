"use client";

import { useEffect } from "react";

export default function AdminRedirectPage() {
    useEffect(() => {
        const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
        const adminPort = process.env.NEXT_PUBLIC_ADMIN_PORT || "3001";
        const target = process.env.NEXT_PUBLIC_ADMIN_URL || `http://${host}:${adminPort}`;
        window.location.replace(target);
    }, []);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1F3A2D",
            color: "#D8B56A",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            padding: "20px"
        }}>
            <div>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>Redirecting to Admin Portal...</h1>
                <p style={{ fontSize: "14px", opacity: 0.8 }}>Please wait while we take you to the Viramah Staff & Admin Console.</p>
            </div>
        </div>
    );
}
