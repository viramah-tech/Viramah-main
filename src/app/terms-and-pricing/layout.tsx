import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Terms & Pricing | Viramah — Transparent Hostel Costs",
    description: "Clear, upfront pricing for all Viramah hostel rooms. No hidden fees. Understand exactly what you pay before you sign — security deposit, GST, and all inclusions.",
    openGraph: {
        title: "Terms & Pricing | Viramah",
        description: "No hidden fees. Understand exactly what you pay before you sign — transparent pricing for all Viramah hostel rooms.",
        url: "https://viramahstay.com/terms-and-pricing",
    },
};

export default function TermsAndPricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
