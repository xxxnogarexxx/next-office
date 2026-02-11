import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
