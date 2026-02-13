import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Clock,
  TrendingUp,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Über uns – NextOffice",
  description:
    "Seit 2017 helfen wir Unternehmen in ganz Deutschland, das passende Büro zu finden. Kostenlos, persönlich und unverbindlich. Erfahren Sie mehr über NextOffice.",
  alternates: {
    canonical: "https://next-office.io/ueber-uns",
  },
};

const stats = [
  { value: "2017", label: "Gegründet" },
  { value: "1.000+", label: "Unternehmen beraten" },
  { value: "30.000+", label: "qm vermittelt" },
  { value: "6", label: "Städte in Deutschland" },
];

const values = [
  {
    icon: Shield,
    title: "100% kostenlos",
    desc: "Wir finanzieren uns ausschließlich über Provisionen der Anbieter. Für Sie entstehen keine Kosten — weder für die Beratung noch für die Vermittlung.",
  },
  {
    icon: Clock,
    title: "Persönliche Beratung",
    desc: "Kein anonymes Self-Service-Portal. Bei uns sprechen Sie mit echten Menschen, die den Markt kennen und Ihre Anforderungen verstehen.",
  },
  {
    icon: TrendingUp,
    title: "Beste Konditionen",
    desc: "Durch unser Partnernetzwerk erhalten Sie die gleichen oder bessere Preise als bei Direktbuchung — oft mit exklusiven Sonderkonditionen.",
  },
];

const testimonials = [
  {
    text: "Der Service war beeindruckend, von der Auswahl der Spaces, die Kommunikation bis hin zu den Besichtigungen war alles top geplant und stets mega freundlich. Ich empfehle den Service definitiv weiter.",
    name: "Melissa Blume",
    role: "Head of HR",
    company: "Salesfive Consulting GmbH",
    avatar: "/testimonial-melissa.jpg",
    office: "/office-melissa.webp",
    logo: "/logo-salesfive.svg",
  },
  {
    text: "NextOffice hat uns dabei unterstützt, das für uns optimal passende Büro zu finden und uns bis zum Vertragsabschluss betreut. Der Service war immer kompetent und freundlich!",
    name: "Dr. Ralf Heublein",
    role: "CEO",
    company: "Mediapool Content Services GmbH",
    avatar: "/testimonial-ralf.jpg",
    office: "/office-heublein.webp",
    logo: "/logo-mediapool.png",
  },
  {
    text: "NextOffice hat uns dabei geholfen, ein geeignetes Büro zu finden. Uns hat die schnelle, professionelle und freundliche Beratung überzeugt und wir können den Service wärmstens empfehlen.",
    name: "Thomas Urban",
    role: "CEO",
    company: "KUMAVISION GmbH",
    avatar: "/testimonial-thomas.jpg",
    office: "/office-thomas.webp",
    logo: "/logo-kumavision.png",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Seit 2017
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Wir machen Bürosuche einfach.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-body sm:text-xl">
              Über 1.000 Unternehmen haben mit uns ihr neues Büro gefunden — in
              Berlin, München, Hamburg, Frankfurt, Köln und Düsseldorf.
              Kostenlos, persönlich und unverbindlich.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-body">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Von CoworkingGuide zu NextOffice
            </h2>
            <div className="mt-6 space-y-4 text-body leading-relaxed">
              <p>
                2017 haben wir als{" "}
                <span className="font-medium text-foreground">
                  CoworkingGuide.de
                </span>{" "}
                begonnen — mit einer einfachen Idee: Unternehmen dabei zu
                helfen, den wachsenden Markt für Coworking und flexible Büros zu
                navigieren. Was als Vergleichsportal startete, wurde schnell zu
                einem umfassenden Beratungsservice.
              </p>
              <p>
                Heute sind wir{" "}
                <span className="font-medium text-foreground">NextOffice</span>{" "}
                — eine Full-Service-Plattform für alle Arten flexibler
                Büroflächen. Von Private Offices und Coworking Spaces bis hin zu
                Enterprise Suites für Teams mit 200+ Mitarbeitern.
              </p>
              <p>
                Unser Ansatz ist dabei gleich geblieben: Wir kennen den Markt,
                verstehen Ihre Anforderungen und finden das Büro, das wirklich
                zu Ihrem Unternehmen passt. Persönlich, nicht automatisiert.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/hero-office.jpg"
              alt="Modernes Büro — NextOffice"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Was uns unterscheidet
            </h2>
            <p className="mt-3 text-body">
              Warum Unternehmen sich für NextOffice entscheiden.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border bg-white p-8 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Person */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="grid sm:grid-cols-5">
              {/* Photo */}
              <div className="relative aspect-square sm:col-span-2 sm:aspect-auto">
                <Image
                  src="/team-benjamin.jpg"
                  alt="Benjamin Plass — Gründer & Büroexperte"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 40vw"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center px-6 py-8 sm:col-span-3 sm:px-10 sm:py-10">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Ihr Ansprechpartner
                </p>
                <h3 className="mt-2 text-2xl font-bold">Benjamin Plass</h3>
                <p className="text-body">Gründer & Büroexperte</p>

                <p className="mt-4 text-sm leading-relaxed text-body">
                  &ldquo;Ich helfe Ihnen persönlich, das passende Büro zu finden
                  — von der ersten Anfrage bis zum Einzug. Mein Ziel: Sie
                  sparen Zeit, Geld und Nerven.&rdquo;
                </p>

                <div className="mt-6 space-y-2.5">
                  <a
                    href="tel:+4930200042000"
                    className="flex items-center gap-2.5 text-sm font-medium text-foreground transition-colors hover:text-blue-600"
                  >
                    <Phone className="h-4 w-4 text-muted-text" />
                    +49 30 200042000
                  </a>
                  <a
                    href="mailto:info@next-office.io"
                    className="flex items-center gap-2.5 text-sm font-medium text-foreground transition-colors hover:text-blue-600"
                  >
                    <Mail className="h-4 w-4 text-muted-text" />
                    info@next-office.io
                  </a>
                  <p className="flex items-center gap-2.5 text-sm text-muted-text">
                    <Clock className="h-4 w-4" />
                    Mo.–Fr. 09:00–18:00 Uhr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Das sagen unsere Kunden
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-body">
            Über 1.000 Unternehmen haben mit uns ihr neues Büro gefunden.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <p className="flex-1 px-6 pt-6 text-sm leading-relaxed text-body">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="relative mx-6 mt-5 aspect-[16/10] overflow-hidden rounded-lg">
                  <Image
                    src={t.office}
                    alt={`Büro von ${t.company}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-text">{t.role}</p>
                    </div>
                  </div>
                  <Image
                    src={t.logo}
                    alt={t.company}
                    width={120}
                    height={32}
                    className="max-h-9 max-w-28 w-auto object-contain object-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-surface lg:rounded-3xl">
          <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Bereit, Ihr neues Büro zu finden?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-body">
              Sagen Sie uns, was Sie suchen — wir finden das passende Büro für
              Sie. 100% kostenlos, unverbindlich und persönlich.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <LeadForm variant="inline" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
              <Link
                href="/search"
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-2 transition-colors hover:text-body"
              >
                Alle Büros durchsuchen
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+4930200042000"
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-2 transition-colors hover:text-body"
              >
                <Phone className="h-4 w-4" />
                +49 30 200042000
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
