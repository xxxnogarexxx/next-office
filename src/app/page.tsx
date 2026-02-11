import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Clock, TrendingUp } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SearchBar } from "@/components/search-bar";
import { cities } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Finden Sie das perfekte
              <br />
              <span className="text-primary">Büro</span> für Ihr Team
            </h1>
            <p className="mt-6 text-lg text-body">
              Vergleichen Sie Büros und Office Spaces in Berlin, München,
              Hamburg und Frankfurt. Kostenlose Beratung, beste Preise garantiert.
            </p>

            {/* Search bar */}
            <div className="mx-auto mt-10 max-w-lg">
              <SearchBar size="lg" />
            </div>

            {/* Quick city links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-body">
              <span>Beliebte Städte:</span>
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="font-medium text-foreground underline underline-offset-2 hover:text-body transition-colors"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Büros nach Stadt
            </h2>
            <p className="mt-2 text-body">
              Finden Sie Office Spaces in den wichtigsten deutschen Städten
            </p>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-1 text-sm font-medium text-foreground hover:text-body sm:flex transition-colors"
          >
            Alle ansehen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={city.image}
                  alt={`Büros in ${city.name}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 p-4 text-white">
                  <h3 className="text-xl font-bold text-white">{city.name}</h3>
                  <p className="mt-0.5 text-sm text-white/80">
                    {city.listingCount} Büros verfügbar
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Warum NextOffice?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-body">
            Wir machen die Bürosuche einfach, schnell und kostenlos für Sie.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "100% kostenlos",
                desc: "Unsere Beratung ist komplett kostenlos für Sie. Wir finanzieren uns über Provisionen der Anbieter.",
              },
              {
                icon: Clock,
                title: "Schnell & einfach",
                desc: "Anfrage in 2 Minuten stellen. Wir finden passende Büros und melden uns innerhalb von 24 Stunden.",
              },
              {
                icon: TrendingUp,
                title: "Beste Konditionen",
                desc: "Durch unsere Partnerschaften erhalten Sie die gleichen oder bessere Preise als bei Direktbuchung.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-lg border bg-white p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead form CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Kostenlose Beratung anfragen
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-body">
            Sagen Sie uns, was Sie suchen — wir finden das passende Büro für Sie.
          </p>
        </div>
        <div className="mt-8">
          <LeadForm variant="inline" />
        </div>
      </section>
    </>
  );
}
