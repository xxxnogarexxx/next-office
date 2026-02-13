import type { Metadata } from "next";
import Image from "next/image";
import {
  Check,
  Phone,
  Mail,
  Clock,
  Search,
  FileText,
  CalendarCheck,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Kontakt – Kostenlose Beratung anfragen",
  description:
    "Kontaktieren Sie NextOffice für eine kostenlose Büroberatung. Wir finden das passende Büro für Ihr Team in Berlin, München, Hamburg oder Frankfurt.",
  alternates: {
    canonical: "https://next-office.io/contact",
  },
};

const steps = [
  {
    icon: Search,
    title: "Anfrage prüfen",
    desc: "Wir fragen für Sie Preise und Verfügbarkeiten an.",
  },
  {
    icon: FileText,
    title: "Angebote erhalten",
    desc: "Sie bekommen zeitnah passende Angebote von uns.",
  },
  {
    icon: CalendarCheck,
    title: "Besichtigen & einziehen",
    desc: "Wir koordinieren die Besichtigungen mit Ihren Favoriten.",
  },
];

const benefits = [
  {
    title: "100% kostenfrei",
    desc: "Es entstehen Ihnen niemals Kosten. Die Provision zahlt der Anbieter.",
  },
  {
    title: "Service aus einer Hand",
    desc: "Sie müssen sich um nichts kümmern. Wir übernehmen die Arbeit.",
  },
  {
    title: "Bestpreis-Garantie",
    desc: "Sie bekommen die gleichen Preise wie direkt vom Anbieter.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero strip */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Kostenlose Büroberatung anfragen
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-body sm:text-lg">
            Sagen Sie uns, was Sie suchen — wir finden passende Büros und melden
            uns innerhalb von 2 Stunden bei Ihnen.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-text">
            <span>1.000+ Unternehmen beraten</span>
            <span className="hidden sm:inline" aria-hidden>
              ·
            </span>
            <span>65+ Städte</span>
            <span className="hidden sm:inline" aria-hidden>
              ·
            </span>
            <span>Seit 2017</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left — Form */}
          <div className="w-full lg:w-3/5">
            <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10">
              <h2 className="text-xl font-bold sm:text-2xl">
                Schnellangebot anfordern
              </h2>
              <p className="mt-2 text-sm text-body">
                Sie haben keine Zeit alle Anbieter Ihrer Stadt zu vergleichen?
                Wir helfen Ihnen schnell und bequem, die relevanten Anbieter zu
                finden.
              </p>

              <div className="mt-6">
                <LeadForm variant="contact" />
              </div>

              <p className="mt-4 text-center text-xs text-muted-text">
                Kostenlos & unverbindlich. Antwort in unter 2 Stunden.
              </p>
            </div>

            {/* Client logos */}
            <div className="mt-8">
              <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-text">
                Vertrauen uns unter anderem
              </p>
              <div className="mt-4 flex items-center justify-center gap-x-10">
                <Image
                  src="/logo-zalando.svg"
                  alt="Zalando"
                  width={100}
                  height={24}
                  className="h-5 w-auto object-contain opacity-50 grayscale"
                />
                <Image
                  src="/logo-canon.svg"
                  alt="Canon"
                  width={80}
                  height={22}
                  className="h-5 w-auto object-contain opacity-50 grayscale"
                />
                <Image
                  src="/logo-fresenius.svg"
                  alt="Fresenius Medical Care"
                  width={100}
                  height={24}
                  className="h-5 w-auto object-contain opacity-50 grayscale"
                />
                <Image
                  src="/logo-sky.svg"
                  alt="Sky"
                  width={80}
                  height={32}
                  className="h-7 w-auto object-contain opacity-50 grayscale"
                />
              </div>
            </div>
          </div>

          {/* Right — Trust & Info */}
          <div className="flex w-full flex-col gap-6 lg:w-2/5">
            {/* Advisor card */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Image
                  src="/team-benjamin.jpg"
                  alt="Benjamin Plass"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Ihr Ansprechpartner
                  </p>
                  <p className="mt-0.5 text-lg font-bold">Benjamin Plass</p>
                  <p className="text-sm text-body">
                    Ihr Experte für die Bürosuche
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="font-medium">
                  Antwortzeit: unter 2 Stunden
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <a
                  href="tel:+4930200042000"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <Phone className="h-4 w-4" />
                  +49 30 200042000
                </a>
                <a
                  href="mailto:info@next-office.io"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <Mail className="h-4 w-4" />
                  info@next-office.io
                </a>
              </div>

              <p className="mt-3 text-center text-xs text-muted-text">
                Mo.–Fr. 09:00–18:00 Uhr
              </p>
            </div>

            {/* Process steps */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold">
                Was passiert als Nächstes?
              </h2>

              <div className="mt-5 flex flex-col gap-5">
                {steps.map(({ icon: Icon, title, desc }, i) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      {i < steps.length - 1 && (
                        <div className="mt-1 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-0.5 text-sm text-body">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-text">
                Typische Dauer: 24–48 Stunden
              </p>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                {benefits.map(({ title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <Check className="h-5 w-5 shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-sm text-body">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
