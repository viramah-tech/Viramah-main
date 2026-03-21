"use client";

// This wrapper exists so that layout.tsx (a Server Component) can include the
// ScheduleVisitModal without violating the Server/Client boundary.
// dynamic() can only be called from Client Components.

import dynamic from "next/dynamic";

const ScheduleVisitModal = dynamic(
    () => import("@/components/ui/ScheduleVisitModal").then((m) => m.ScheduleVisitModal),
    { ssr: false }
);

export function LazyScheduleVisitModal() {
    return <ScheduleVisitModal />;
}
