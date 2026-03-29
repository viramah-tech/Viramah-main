import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "../styles/globals.css";
import { LazyEnquiryModal } from "@/components/ui/LazyEnquiryModal";
import { EnquiryProvider } from "@/context/EnquiryContext";
import { ScheduleVisitProvider } from "@/context/ScheduleVisitContext";
import { LazyScheduleVisitModal } from "@/components/ui/LazyScheduleVisitModal";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",   // Show fallback font immediately — no invisible text
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,    // Mono is decorative — no need to block for it
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viramahstay.com"),
  title: "Viramah | Premium Student Living & Experience-Focused Hostels in India",
  description: "Dignified student housing reimagined. Intentional living with premium amenities, community focus, and comfort that feels like home. Best hostel for students in India.",
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
      <head>
        {/* DNS prefetch & preconnect for third-party scripts */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Viewport with safe-area coverage for notched devices */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
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

        {/* ── Meta Pixel ── */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            try {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '858500703843090');
              fbq('track', 'PageView');
            } catch(e) {
              console.warn('[Meta Pixel] Init error suppressed:', e);
            }
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=858500703843090&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              "name": "Viramah",
              "image": "https://viramahstay.com/logo.png",
              "@id": "https://viramahstay.com",
              "url": "https://viramahstay.com",
              "email": "team@viramahstay.com",
              "priceRange": "₹₹",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Krishna Valley",
                "addressLocality": "Vrindavan",
                "addressRegion": "Uttar Pradesh",
                "postalCode": "281121",
                "addressCountry": "IN"
              },
              "description": "Premium student living reimagined. Experience intentional living with premium amenities, community focus, and comfort that feels like home.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "100"
              },
              "amenityFeature": [
                { "@type": "LocationFeatureSpecification", "name": "High-Speed WiFi", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "3 Meals a Day", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "Gaming Zone", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "24/7 Security", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "Gym", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "Library", "value": true }
              ],
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
        <AuthProvider>
          <ToastProvider>
            <EnquiryProvider>
              <ScheduleVisitProvider>
                {children}
                <LazyEnquiryModal />
                <LazyScheduleVisitModal />
              </ScheduleVisitProvider>
            </EnquiryProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
