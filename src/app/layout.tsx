import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "../styles/globals.css";
import { EnquiryModal } from "@/components/ui/EnquiryModal";
import { EnquiryProvider } from "@/context/EnquiryContext";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viramahstay.com"),
  title: "Viramah | Premium Student Living & Experience-Focused Hostels in India",
  description: "Dignified student housing reimagined. Experience intentional living with premium amenities, community focus, and comfort that feels like home. The best premium hostel for students in India.",
  keywords: [
    "premium hostel in India",
    "experience focused hostel",
    "best premium hostel for students",
    "modern hostel living",
    "luxury hostel India",
    "community living hostel",
    "student lifestyle hostel",
    "gen z hostel India",
    "premium PG alternative",
    "co living hostel India",
    "intentional living hostel",
    "high quality student housing",
    "hostel with dignity and comfort"
  ],
  authors: [{ name: "Viramah Team" }],
  creator: "Viramah",
  publisher: "Viramah",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Viramah | Premium Student Living reimagined",
    description: "Premium student living reimagined — where comfort, community, and craft come together.",
    url: "https://viramahstay.com",
    siteName: "Viramah",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viramah | Premium Student Living",
    description: "Premium student living reimagined with dignity and comfort.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerif.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* ── Google Analytics 4 ── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XJTTHXGX9Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XJTTHXGX9Z');
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Viramah",
              "image": "https://viramahstay.com/logo.png",
              "@id": "",
              "url": "https://viramahstay.com",
              "telephone": "",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Krishna Valley",
                "addressLocality": "Vrindavan",
                "postalCode": "281121",
                "addressCountry": "IN"
              },
              "description": "Premium student living reimagined. Experience intentional living with premium amenities, community focus, and comfort that feels like home.",
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              }
            })
          }}
        />
        <EnquiryProvider>
          {children}
          <EnquiryModal />
        </EnquiryProvider>
      </body>
    </html>
  );
}
