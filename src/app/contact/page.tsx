import type { Metadata } from "next";
import { Check, Phone, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Kontakt – Kostenlose Beratung anfragen",
  description:
    "Kontaktieren Sie NextOffice für eine kostenlose Büroberatung. Wir finden das passende Büro für Ihr Team in Berlin, München, Hamburg oder Frankfurt.",
  alternates: {
    canonical: "https://next-office.io/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-24">
        {/* Left — Form */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-bold">Schnellangebot anfordern</h1>
          <p className="mt-3 text-body">
            Sie haben keine Zeit alle Anbieter Ihrer Stadt zu vergleichen? Wir
            helfen Ihnen schnell und bequem, die relevanten Anbieter zu finden
            und melden uns innerhalb von 2 Stunden bei Ihnen.
          </p>

          <div className="mt-8">
            <LeadForm variant="contact" />
          </div>
        </div>

        {/* Right — Info */}
        <div className="w-full lg:w-1/2">
          {/* Steps */}
          <h2 className="text-lg font-semibold">Was passiert als Nächstes?</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {[
              "Wir fragen für Sie Preise und Verfügbarkeiten an.",
              "Sie bekommen zeitnah passende Angebote.",
              "Wir koordinieren die Besichtigungen mit Ihren Favoriten.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-body">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <Separator className="my-6" />

          {/* Direct contact */}
          <p className="text-sm text-body">
            Wenn Sie Zeit sparen wollen, können Sie uns auch gerne direkt
            anrufen oder schreiben. Wir erreichen uns von Mo.–Fr. von
            09:00–18:00 Uhr.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:+4930200042000"
              className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
            >
              <Phone className="h-4 w-4 text-muted-text" />
              +49 30 200042000
            </a>
            <a
              href="mailto:info@next-office.io"
              className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
            >
              <Mail className="h-4 w-4 text-muted-text" />
              info@next-office.io
            </a>
          </div>

          <Separator className="my-6" />

          {/* Contact person */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-lg font-bold text-foreground">
              SW
            </div>
            <div>
              <p className="font-semibold text-sm">Ihr Ansprechpartner</p>
              <p className="text-sm text-muted-text">Szymon Wilkosz</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Benefits */}
          <div className="flex flex-col gap-4">
            {[
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
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary" />
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
  );
}
