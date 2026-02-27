import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"], // latin-ext adds German umlaut/eszett support (SEO-10)
});

const SITE_URL = "https://next-office.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Büro mieten – Flexible Office Spaces in Deutschland | NextOffice",
    template: "%s | NextOffice",
  },
  description:
    "Finden Sie flexible Büros und Office Spaces in Berlin, München, Hamburg und Frankfurt. Kostenlose Beratung, beste Preise garantiert.",
  keywords: [
    "Büro mieten",
    "Office Space",
    "Büro Berlin",
    "Büro München",
    "Büro Hamburg",
    "Büro Frankfurt",
    "Private Office",
    "Büro mieten Deutschland",
    "Flexible Büros",
  ],
  authors: [{ name: "NextOffice" }],
  creator: "NextOffice",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "NextOffice",
    title: "Büro mieten – Flexible Office Spaces in Deutschland | NextOffice",
    description:
      "Finden Sie flexible Büros und Office Spaces in Berlin, München, Hamburg und Frankfurt. Kostenlose Beratung, beste Preise garantiert.",
    images: [{ url: "/hero-office.jpg", width: 1200, height: 630, alt: "NextOffice – Flexible Büros in Deutschland" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Büro mieten – Flexible Office Spaces in Deutschland | NextOffice",
    description:
      "Finden Sie flexible Büros und Office Spaces in Berlin, München, Hamburg und Frankfurt.",
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
  alternates: {
    canonical: SITE_URL,
  },
};

/**
 * Root layout — bare shell.
 *
 * Renders html/body/fonts only. Header, Footer, and tracking are
 * handled by group-level layouts: (main)/layout.tsx and (lp)/layout.tsx.
 * Both route groups inherit this shell.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://tiles.mapbox.com" />
        <link rel="dns-prefetch" href="https://events.mapbox.com" />
        <link rel="preconnect" href="https://api.mapbox.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tiles.mapbox.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
