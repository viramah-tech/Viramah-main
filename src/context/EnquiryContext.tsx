"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface EnquiryContextType {
    openEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextType>({ openEnquiry: () => { } });

export function EnquiryProvider({ children }: { children: ReactNode }) {
    const [, setOpen] = useState(false);

    // We expose a global event so EnquiryModal (which manages its own state)
    // can listen and open itself from anywhere.
    const openEnquiry = () => {
        window.dispatchEvent(new CustomEvent("viramah:open-enquiry"));
    };

    return (
        <EnquiryContext.Provider value={{ openEnquiry }}>
            {children}
        </EnquiryContext.Provider>
    );
}

export function useEnquiry() {
    return useContext(EnquiryContext);
}
