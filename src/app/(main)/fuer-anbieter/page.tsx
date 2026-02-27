import type { Metadata } from "next";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  Handshake,
  BarChart3,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Für Anbieter – NextOffice",
  description:
    "Listen Sie Ihre Büroflächen kostenlos auf NextOffice. Erreichen Sie Unternehmen, die aktiv nach flexiblen Büros suchen — ohne Vorabkosten.",
  alternates: {
    canonical: "https://next-office.io/fuer-anbieter",
  },
};

const benefits = [
  {
    icon: Users,
    title: "Qualifizierte Anfragen",
    desc: "Sie erhalten ausschließlich vorqualifizierte Anfragen von Unternehmen, die aktiv nach Büroflächen suchen.",
  },
  {
    icon: TrendingUp,
    title: "Höhere Auslastung",
    desc: "Mehr Sichtbarkeit für Ihre Flächen — wir bringen Ihre Angebote direkt vor die richtige Zielgruppe.",
  },
  {
    icon: Handshake,
    title: "Nur bei Erfolg",
    desc: "Keine Vorabkosten, keine Listungsgebühren. Sie zahlen nur eine Provision bei erfolgreichem Vertragsabschluss.",
  },
  {
    icon: BarChart3,
    title: "Marktexpertise",
    desc: "Profitieren Sie von unserer Erfahrung aus über 1.000 erfolgreichen Vermittlungen in der DACH-Region.",
  },
];

const steps = [
  {
    step: "01",
    title: "Kontakt aufnehmen",
    desc: "Schreiben Sie uns oder rufen Sie an. Wir besprechen Ihre verfügbaren Flächen und Konditionen.",
  },
  {
    step: "02",
    title: "Flächen listen",
    desc: "Wir erstellen ansprechende Listings mit Fotos, Ausstattung und Preisen — kostenlos für Sie.",
  },
  {
    step: "03",
    title: "Anfragen erhalten",
    desc: "Sobald passende Unternehmen anfragen, bringen wir Sie zusammen. Sie entscheiden, wer besichtigt.",
  },
  {
    step: "04",
    title: "Vertrag abschließen",
    desc: "Wir begleiten den Prozess bis zum Abschluss. Provision fällt nur bei erfolgreichem Deal an.",
  },
];

const features = [
  "Kostenlose Listung Ihrer Flächen",
  "Professionelle Fotos & Beschreibungen",
  "Vorqualifizierte Unternehmensanfragen",
  "Persönlicher Ansprechpartner",
  "Keine Vertragslaufzeit",
  "Provision nur bei Erfolg",
];

export default function ForProvidersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Für Anbieter
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Vermieten Sie Ihre Büroflächen schneller.
              </h1>
              <p className="mt-6 text-lg text-body">
                Erreichen Sie Unternehmen, die aktiv nach flexiblen Büros
                suchen. Kostenlos listen, nur bei Erfolg zahlen.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-sm text-body">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/about-office.jpg"
                alt="Modernes Büro zur Vermietung"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Warum mit NextOffice arbeiten?
          </h2>
          <p className="mt-3 text-body">
            Wir bringen Anbieter und Unternehmen zusammen — unkompliziert und
            erfolgsorientiert.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              So funktioniert&apos;s
            </h2>
            <p className="mt-3 text-body">
              In vier Schritten zu mehr Mietern für Ihre Büroflächen.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <span className="text-4xl font-bold text-slate-200">
                  {step}
                </span>
                <h3 className="mt-2 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="grid lg:grid-cols-5">
            {/* Form */}
            <div className="px-6 py-10 sm:px-10 sm:py-14 lg:col-span-3 lg:px-14 lg:py-16">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Jetzt Flächen listen
              </h2>
              <p className="mt-3 max-w-lg text-body">
                Kontaktieren Sie uns — wir besprechen Ihre verfügbaren Flächen
                und erstellen Ihre Listings innerhalb von 48 Stunden.
              </p>

              <div className="mt-8">
                <LeadForm variant="inline" />
              </div>
            </div>

            {/* Contact person */}
            <div className="flex flex-col items-center justify-center bg-surface px-6 py-10 text-center sm:px-10 lg:col-span-2 lg:py-16">
              <Image
                src="/team-benjamin.jpg"
                alt="Benjamin Plass"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
              <p className="mt-4 text-lg font-bold text-foreground">
                Benjamin Plass
              </p>
              <p className="text-sm text-body">Partnermanagement</p>

              <div className="mt-6 w-full max-w-xs space-y-3">
                <p className="text-sm text-muted-text">
                  Mo.–Fr. 09:00–18:00 Uhr
                </p>
                <a
                  href="tel:+4930200042000"
                  className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <Phone className="h-4 w-4" />
                  +49 30 200042000
                </a>
                <a
                  href="mailto:anfrage@next-office.io"
                  className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <Mail className="h-4 w-4" />
                  anfrage@next-office.io
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
