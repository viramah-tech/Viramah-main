import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Contact — Viramah Stay",
    description: "Verify your email and phone number to continue with your Viramah onboarding.",
};

export default function VerifyContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
