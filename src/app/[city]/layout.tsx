import type { Metadata } from "next";
import { getCityBySlug } from "@/lib/listings";

interface LayoutProps {
  params: Promise<{ city: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  const cityName = city?.name ?? citySlug;

  const title = `Büro ${cityName} – Office Spaces mieten`;
  const description = `Büro mieten in ${cityName}: Vergleichen Sie ${city?.listingCount ?? ""} flexible Office Spaces und Private Offices. Kostenlose Beratung, beste Preise.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://next-office.io/${citySlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://next-office.io/${citySlug}`,
    },
  };
}

export default function CityLayout({ children }: LayoutProps) {
  return children;
}
