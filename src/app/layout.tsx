import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
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
    url: "https://viramah.com",
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
        <EnquiryProvider>
          {children}
          <EnquiryModal />
        </EnquiryProvider>
      </body>
    </html>
  );
}
