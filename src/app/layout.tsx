import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BackToTop } from "@/components/ui/back-to-top";
import { PageTransition } from "@/components/ui/page-transition";
import { ConditionalLayout } from "@/components/layout/conditional-layout"
import { AuthProvider } from "@/contexts/auth-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { TrackingProvider } from "@/components/providers/tracking-provider"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avacasa | Holiday Homes, Farmlands and Vacation Real Estate",
  description: "Discover and invest in curated holiday homes and managed farmlands across India's favorite destinations. Seamless ownership, expert advisory.",
  keywords: "holiday homes, farmlands, vacation real estate, property investment, India, Goa, Mysore, Coorg, Chikkamagaluru",
  authors: [{ name: "Avacasa" }],
  creator: "Avacasa",
  publisher: "Avacasa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.avacasa.life"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Avacasa | Holiday Homes, Farmlands and Vacation Real Estate",
    description: "Discover and invest in curated holiday homes and managed farmlands across India's favorite destinations.",
    url: "https://www.avacasa.life",
    siteName: "Avacasa",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Avacasa - Holiday Homes and Vacation Real Estate",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Avacasa | Holiday Homes, Farmlands and Vacation Real Estate",
    description: "Discover and invest in curated holiday homes and managed farmlands across India's favorite destinations.",
    images: ["/og-image.jpg"],
    creator: "@avacasa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <SettingsProvider>
          <AuthProvider>
            <TrackingProvider>
              <ConditionalLayout>
                <main className="min-h-screen">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
                <BackToTop />
              </ConditionalLayout>
            </TrackingProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
