"use client";

import { createContext, useContext, ReactNode } from "react";

interface ScheduleVisitContextType {
    openScheduleVisit: () => void;
}

const ScheduleVisitContext = createContext<ScheduleVisitContextType>({
    openScheduleVisit: () => {},
});

export function ScheduleVisitProvider({ children }: { children: ReactNode }) {
    const openScheduleVisit = () => {
        window.dispatchEvent(new CustomEvent("viramah:open-schedule-visit"));
    };

    return (
        <ScheduleVisitContext.Provider value={{ openScheduleVisit }}>
            {children}
        </ScheduleVisitContext.Provider>
    );
}

export function useScheduleVisit() {
    return useContext(ScheduleVisitContext);
}
