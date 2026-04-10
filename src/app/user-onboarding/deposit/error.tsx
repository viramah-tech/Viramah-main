"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("PAGE CRASH:", error);
  }, [error]);

  return (
    <div style={{ padding: "40px", background: "#fef2f2", border: "2px solid #dc2626", borderRadius: 12, margin: 20 }}>
      <h2 style={{ color: "#dc2626", fontFamily: "var(--font-heading, sans-serif)", fontSize: "1.5rem" }}>Something went wrong!</h2>
      <pre style={{ color: "#7f1d1d", fontSize: "0.8rem", background: "rgba(220,38,38,0.1)", padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", overflowX: "auto" }}>
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button
        onClick={() => reset()}
        style={{ marginTop: 20, padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
