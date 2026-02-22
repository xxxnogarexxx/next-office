import type { Metadata } from "next";
import { getLPCity, isValidLPCity } from "@/lib/lp/cities";

interface LayoutProps {
  params: Promise<{ city: string }>;
  children: React.ReactNode;
}

/**
 * City-level layout for LP pages.
 *
 * Handles SEO metadata generation. Invalid city slugs are rejected
 * in the page component with notFound().
 */
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { city: citySlug } = await params;

  if (!isValidLPCity(citySlug)) {
    return {};
  }

  const city = getLPCity(citySlug);
  if (!city) return {};

  const title = `Büro mieten ${city.name} – ${city.listingCount} Office Spaces`;
  const description = `Büro mieten in ${city.name}: Vergleichen Sie ${city.listingCount} flexible Office Spaces. Kostenlose Beratung, beste Preise. Angebote in 30 Minuten.`;
  const canonicalUrl = `https://next-office.io/lp/${citySlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function CityLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
