// src/app/layout.tsx - CORRECTED with Social Sharing Metadata

import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond, JetBrains_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "computer-modern/cmu-serif.css";
import "./globals.css";

// 1. HEADINGS (Serif Display) - For Titles
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

// 2. BODY (Serif Text) - For Paragraphs/Reading
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-body",
  display: "swap",
});

// 3. CODE (Monospace) - For Data/Terminals
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// 4. UI (Sans Serif) - Reserved ONLY for the Showcase/Bloodline project
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// --- FIX: UPDATED METADATA FOR SOCIAL SHARING & SEO ---
export const metadata: Metadata = {
  // Base SEO tags
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nhphi.tech'),
  title: "The Null Hypothesis | Calculated Uncertainty",
  description: "Reject the default. A data science platform for the rigorous.",

  // Open Graph (Facebook, WhatsApp, LinkedIn, general sharing)
  openGraph: {
    title: "The Null Hypothesis",
    description: "Reject the default. A data science platform for the rigorous.",
    url: 'https://nhphi.tech/',
    siteName: 'The Null Hypothesis',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ezz Eldin Portfolio Social Preview Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "The Null Hypothesis",
    description: "Reject the default. A data science platform for the rigorous.",
    creator: '@nhphi',
    images: ['/images/og-image.jpg'],
  },
};
// ------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${cormorant.variable} 
          ${ebGaramond.variable} 
          ${jetbrains.variable} 
          ${inter.variable} 
          bg-paper 
          text-ink 
          antialiased 
        `}
      >
        <Providers>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}