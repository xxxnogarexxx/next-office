import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Clock, TrendingUp, Star, Phone, Mail } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SearchBar } from "@/components/search-bar";
import { cities } from "@/lib/mock-data";

const testimonials = [
  {
    text: "Der Service war beeindruckend, von der Auswahl der Spaces, die Kommunikation bis hin zu den Besichtigungen war alles top geplant und stets mega freundlich. Ich empfehle den Service definitiv weiter.",
    name: "Melissa Blume",
    role: "Head of HR",
    company: "Salesfive Consulting GmbH",
  },
  {
    text: "NextOffice hat uns dabei unterstützt, das für uns optimal passende Büro zu finden und uns bis zum Vertragsabschluss betreut. Der Service war immer kompetent und freundlich!",
    name: "Dr. Ralf Heublein",
    role: "Geschäftsführer",
    company: "Mediapool Content Services GmbH",
  },
  {
    text: "NextOffice hat uns dabei geholfen, ein geeignetes Büro zu finden. Uns hat die schnelle, professionelle und freundliche Beratung überzeugt und wir können den Service wärmstens empfehlen.",
    name: "Thomas Urban",
    role: "Geschäftsführer",
    company: "KUMAVISION GmbH",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-2 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-surface lg:rounded-3xl">
          <div className="grid lg:grid-cols-2">
            {/* Text — centered on mobile, left-aligned on desktop */}
            <div className="flex flex-col items-center px-6 pt-10 pb-2 text-center sm:px-10 sm:pt-14 lg:items-start lg:justify-center lg:px-14 lg:py-20 lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Bürosuche war noch
                <br />
                nie so einfach.
              </h1>
              <p className="mt-4 max-w-md text-base text-body sm:text-lg">
                Wir sind Deutschlands Plattform für flexible Büros und Office
                Spaces — kostenlose Beratung, beste Konditionen.
              </p>

              {/* Search bar — desktop only */}
              <div className="mt-8 hidden w-full max-w-lg lg:block">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Büro finden
                </p>
                <SearchBar variant="hero" />
              </div>

              {/* Quick city links — desktop only */}
              <div className="mt-5 hidden flex-wrap items-center gap-2 text-sm text-body lg:flex">
                <span>Beliebte Städte:</span>
                {cities.slice(0, 4).map((city) => (
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

            {/* Right — hero image with fade (desktop) */}
            <div className="relative hidden min-h-[400px] overflow-hidden rounded-r-2xl lg:block lg:rounded-r-3xl">
              <Image
                src="/hero-office.jpg"
                alt="Modernes Open-Space-Büro mit Personen an Holztischen"
                fill
                priority
                className="object-cover"
                sizes="50vw"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, #F8FAFC 0%, rgba(248,250,252,0.6) 25%, rgba(248,250,252,0.2) 50%, rgba(248,250,252,0) 70%)",
                }}
              />
            </div>
          </div>

          {/* Mobile hero image */}
          <div className="relative mx-4 mt-6 aspect-[16/10] overflow-hidden rounded-xl lg:hidden">
            <Image
              src="/hero-office.jpg"
              alt="Modernes Open-Space-Büro mit Personen an Holztischen"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Mobile search bar — card overlapping bottom of image */}
          <div className="relative z-10 mx-auto -mt-12 w-[85%] max-w-sm pb-6 lg:hidden">
            <div className="rounded-2xl bg-white px-4 pb-3 pt-4 shadow-lg">
              <p className="mb-2 text-sm font-medium text-foreground">
                Büro finden
              </p>
              <SearchBar
                variant="hero"
                className="[&>div:first-child]:bg-transparent [&>div:first-child]:p-0 [&>div:first-child]:shadow-none [&>div:first-child]:rounded-none"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm text-body">
              <span>Beliebte Städte:</span>
              {cities.slice(0, 4).map((city) => (
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

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Das sagen unsere Kunden
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-body">
          Über 500 Unternehmen haben mit uns ihr neues Büro gefunden.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-xl border bg-white p-6"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-body">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-6 border-t pt-4">
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-text">
                  {t.role}, {t.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-5">
            {/* Left — form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Kontaktieren Sie uns und finden das
                <br className="hidden sm:block" />
                richtige Büro für Ihr Business.
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  "100% kostenlos: Es entstehen Ihnen niemals Kosten.",
                  "Bestpreis-Garantie: Sie bekommen die niedrigsten Preise.",
                  "Service aus einer Hand: Sie müssen sich um nichts kümmern.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-body">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <LeadForm variant="inline" />
              </div>
            </div>

            {/* Right — contact card */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <Image
                    src="/team-benjamin.jpg"
                    alt="Benjamin Plass"
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-foreground">
                      Ihr Ansprechpartner
                    </p>
                    <p className="text-sm text-body">Benjamin Plass</p>
                  </div>
                </div>

                <hr className="my-5" />

                <p className="text-sm text-body">
                  Wir sind von Mo. - Fr. von 09:00-18:00 Uhr telefonisch für
                  Sie erreichbar!
                </p>

                <div className="mt-5 space-y-4">
                  <a
                    href="tel:+4930200042000"
                    className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-5 w-5 text-muted-text" />
                    +49 30 200042000
                  </a>
                  <a
                    href="mailto:info@next-office.io"
                    className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5 text-muted-text" />
                    info@next-office.io
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
