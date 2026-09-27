"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function AdminCatchAllRedirectPage() {
    const params = useParams();

    useEffect(() => {
        const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
        const adminPort = process.env.NEXT_PUBLIC_ADMIN_PORT || "3001";
        const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || `http://${host}:${adminPort}`;
        
        const slug = params?.slug;
        const subpath = Array.isArray(slug) ? slug.join("/") : (slug || "");
        // Map common dashboard paths
        const targetPath = subpath === "dashboard" ? "/" : `/${subpath}`;
        
        window.location.replace(`${baseUrl.replace(/\/$/, "")}${targetPath}`);
    }, [params]);

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
                <p style={{ fontSize: "14px", opacity: 0.8 }}>Taking you to the Viramah Admin Console.</p>
            </div>
        </div>
    );
}
