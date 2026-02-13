import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Users,
  Euro,
  Wifi,
  Car,
  UtensilsCrossed,
  Clock,
  Building2,
  Armchair,
  Accessibility,
  Bike,
  ShowerHead,
  Phone,
  PartyPopper,
  ArrowLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ListingCard } from "@/components/listing-card";
import { PhotoGallery } from "@/components/photo-gallery";
import { ListingMap } from "@/components/listing-map";
import { getListingBySlug, getListingsByCity } from "@/lib/listings";
import { ListingPageClient } from "./listing-page-client";

interface PageProps {
  params: Promise<{ city: string; listing: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, listing: listingSlug } = await params;
  const listing = getListingBySlug(listingSlug);

  if (!listing) {
    return { title: "Nicht gefunden" };
  }

  const title = `${listing.name} – Büro mieten in ${listing.city}`;
  const capacityDesc = listing.capacityMin !== null && listing.capacityMax !== null
    ? `${listing.capacityMin}–${listing.capacityMax} Personen, `
    : "";
  const priceDesc = listing.priceFrom !== null ? `ab ${listing.priceFrom} €/Monat. ` : "";
  const description = `${listing.name} in ${listing.address}, ${listing.city}. ${capacityDesc}${priceDesc}Jetzt kostenlos anfragen.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://next-office.io/${citySlug}/${listingSlug}`,
      images: listing.coverPhoto ? [{ url: listing.coverPhoto }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://next-office.io/${citySlug}/${listingSlug}`,
    },
  };
}

const amenityIcons: Record<string, React.ElementType> = {
  WLAN: Wifi,
  Parkplätze: Car,
  Küche: UtensilsCrossed,
  "24/7 Zugang": Clock,
  Empfang: Building2,
  Möbliert: Armchair,
  Barrierearm: Accessibility,
  Fahrradstellplätze: Bike,
  Duschen: ShowerHead,
  Telefonkabinen: Phone,
  "Event-Fläche": PartyPopper,
  Meetingräume: Users,
};

export default async function ListingDetailPage({ params }: PageProps) {
  const { city: citySlug, listing: listingSlug } = await params;
  const listing = getListingBySlug(listingSlug);

  if (!listing) {
    notFound();
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description,
    image: listing.photos.length > 0 ? listing.photos : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city,
      postalCode: listing.postalCode,
      addressCountry: listing.country,
    },
    url: `https://next-office.io/${citySlug}/${listingSlug}`,
  };
  if (listing.latitude !== null && listing.longitude !== null) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: listing.latitude,
      longitude: listing.longitude,
    };
  }
  if (listing.priceFrom !== null) {
    jsonLd.priceRange = `ab ${listing.priceFrom} €/Monat`;
  }

  const similarListings = getListingsByCity(listing.citySlug)
    .filter((l) => l.id !== listing.id)
    .slice(0, 3);

  // Generate offers from listing data
  const offers = [
    {
      type: "private_office" as const,
      label: "Private Office",
      capacityMin: 1,
      capacityMax: 2,
      areaSqmMin: 5,
      areaSqmMax: 8,
      price: listing.priceFrom ?? undefined,
    },
    {
      type: "private_office" as const,
      label: "Private Office",
      capacityMin: 3,
      capacityMax: 10,
      areaSqmMin: 12,
      areaSqmMax: 40,
    },
    {
      type: "private_office" as const,
      label: "Private Office",
      capacityMin: 11,
      capacityMax: 20,
      areaSqmMin: 33,
      areaSqmMax: 60,
    },
    {
      type: "suite" as const,
      label: "Suite",
      capacityMin: 21,
      capacityMax: 50,
      areaSqmMin: 60,
      areaSqmMax: 200,
    },
    {
      type: "suite" as const,
      label: "Enterprise Suite",
      capacityMin: 51,
      capacityMax: 200,
      areaSqmMin: 201,
      areaSqmMax: 1000,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href={`/${citySlug}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-body hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Büros in {listing.city}
        </Link>

        {/* Photo gallery — clickable, opens fullscreen */}
        {listing.photos.length > 0 && (
          <div className="mt-4">
            <PhotoGallery photos={listing.photos} name={listing.name} />
          </div>
        )}

        {/* Title section — above flex so sidebar aligns with key facts */}
        <div className={listing.photos.length > 0 ? "mt-8" : "mt-4"}>
          {listing.providerName && (
            <p className="text-sm font-medium text-muted-text">
              {listing.providerName}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-bold">{listing.name}</h1>
        </div>

        {/* Content + Sidebar */}
        <div className="mt-6 flex gap-12 lg:gap-16">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Key facts */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  icon: MapPin,
                  label: "Adresse",
                  value: `${listing.address}, ${listing.postalCode} ${listing.city}`,
                },
                (listing.capacityMin !== null || listing.capacityMax !== null) ? {
                  icon: Users,
                  label: "Kapazität",
                  value: listing.capacityMin !== null && listing.capacityMax !== null
                    ? `${listing.capacityMin}–${listing.capacityMax} Personen`
                    : listing.capacityMax !== null
                      ? `bis ${listing.capacityMax} Personen`
                      : `ab ${listing.capacityMin} Personen`,
                } : null,
                {
                  icon: Euro,
                  label: "Preis",
                  value: listing.priceFrom !== null ? `ab ${listing.priceFrom} €/Monat` : "Auf Anfrage",
                },
                listing.noticePeriod ? {
                  icon: Clock,
                  label: "Kündigungsfrist",
                  value: listing.noticePeriod,
                } : null,
              ].filter(Boolean).map((fact) => {
                const { icon: Icon, label, value } = fact!;
                return (
                  <div key={label} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-text" />
                      <span className="text-xs text-muted-text">{label}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                );
              })}
            </div>

            <Separator className="my-8" />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold">Über dieses Büro</h2>
              <p className="mt-4 text-body leading-relaxed">
                {listing.description}
              </p>
            </div>

            <Separator className="my-8" />

            {/* Available Offers — client component */}
            <ListingPageClient listing={listing} offers={offers} />

            <Separator className="my-8" />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold">Ausstattung</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Building2;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Icon className="h-5 w-5 text-muted-text" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sticky sidebar — desktop (lower position) */}
          <div className="hidden w-[370px] shrink-0 lg:block">
            <div className="sticky top-24">
              <ListingPageClient
                listing={listing}
                offers={offers}
                sidebarOnly
              />
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Location — full width */}
        <div>
          <h2 className="text-xl font-semibold">Standort</h2>
          <p className="mt-2 text-body">
            {listing.address}, {listing.postalCode} {listing.city}
          </p>
          {listing.latitude !== null && listing.longitude !== null && (
            <div className="mt-4">
              <ListingMap
                latitude={listing.latitude}
                longitude={listing.longitude}
                name={listing.name}
                address={`${listing.address}, ${listing.postalCode} ${listing.city}`}
              />
            </div>
          )}
        </div>

        {/* Similar listings */}
        {similarListings.length > 0 && (
          <div className="mt-16 mb-8">
            <h2 className="text-xl font-semibold">
              Weitere Büros in {listing.city}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bottom CTA */}
      <ListingPageClient listing={listing} offers={offers} mobileBarOnly />
    </>
  );
}
