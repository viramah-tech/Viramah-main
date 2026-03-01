"use client";

// This wrapper exists so that layout.tsx (a Server Component) can include the
// EnquiryModal without violating the Server/Client boundary.
// dynamic() can only be called from Client Components.
import dynamic from "next/dynamic";

const EnquiryModal = dynamic(
    () => import("@/components/ui/EnquiryModal").then((m) => m.EnquiryModal),
    { ssr: false }
);

export function LazyEnquiryModal() {
    return <EnquiryModal />;
}
