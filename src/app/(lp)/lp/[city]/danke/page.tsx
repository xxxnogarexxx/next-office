import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getLPCity } from "@/lib/lp/cities";
import type { Metadata } from "next";
import { ConversionTracker } from "./conversion-tracker";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getLPCity(citySlug);
  if (!city) return {};

  return {
    title: `Anfrage erhalten — ${city.name} | NextOffice`,
    robots: { index: false, follow: false },
  };
}

/**
 * LP thank-you confirmation page.
 *
 * Shown after successful lead form submission. Sets expectations for
 * response time and personalizes confirmation text with the city name.
 *
 * TRACK-02: Google Ads conversion tag fires here via <ConversionTracker />.
 * ConversionTracker is a client component island — the page itself remains
 * a server component for optimal performance.
 *
 * robots: noindex — conversion confirmation pages should not be indexed.
 */
export default async function DankePage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getLPCity(citySlug);
  if (!city) notFound();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      {/* Client island: fires Google Ads conversion + GA4 event on load */}
      <ConversionTracker />

      <div className="mx-auto max-w-lg text-center">
        {/* Checkmark icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2
              className="h-10 w-10 text-success"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
          Vielen Dank für Ihre Anfrage!
        </h1>

        {/* Response time expectation */}
        <p className="mb-3 text-lg text-muted-foreground">
          Wir melden uns innerhalb von{" "}
          <strong className="text-foreground">2 Stunden</strong> bei Ihnen —
          in der Regel deutlich schneller.
        </p>

        {/* City-personalized next steps */}
        <p className="mb-8 text-base text-muted-foreground">
          Unsere Experten suchen jetzt die besten Büros in{" "}
          <strong className="text-foreground">{city.name}</strong> für Sie.
        </p>

        {/* Back link */}
        <Link
          href={`/lp/${city.slug}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  );
}
