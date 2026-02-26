import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://next-office.io/agb",
  },
};

export default function AGBPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>

      <div className="mt-8 space-y-8 text-sm text-body leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 1 Geltungsbereich
          </h2>
          <p className="mt-2">
            (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die
            Nutzung der Website next-office.io (nachfolgend „Plattform"), die
            von der softurio UG (haftungsbeschränkt), Schopenstehl 13, 20095
            Hamburg (nachfolgend „NextOffice" oder „wir") betrieben wird.
          </p>
          <p className="mt-2">
            (2) NextOffice vermittelt Büroflächen und Office Spaces zwischen
            Anbietern (Vermietern) und Suchenden (Interessenten). Die Plattform
            dient ausschließlich der Vermittlung und Kontaktherstellung.
          </p>
          <p className="mt-2">
            (3) Abweichende Bedingungen des Nutzers werden nicht anerkannt, es
            sei denn, NextOffice stimmt ihrer Geltung ausdrücklich schriftlich
            zu.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 2 Leistungen
          </h2>
          <p className="mt-2">
            (1) NextOffice stellt eine kostenlose Plattform zur Verfügung, auf
            der Interessenten Büroflächen suchen, vergleichen und anfragen
            können.
          </p>
          <p className="mt-2">
            (2) Die Nutzung der Plattform ist für Interessenten (Bürosuchende)
            kostenlos. NextOffice finanziert sich über Provisionen, die von den
            Büroanbietern bei erfolgreicher Vermittlung gezahlt werden.
          </p>
          <p className="mt-2">
            (3) NextOffice übernimmt keine Garantie für die Verfügbarkeit,
            Richtigkeit oder Vollständigkeit der auf der Plattform angezeigten
            Angebote. Alle Angaben zu Preisen, Flächen und Ausstattung beruhen
            auf Informationen der jeweiligen Anbieter.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 3 Anfragen und Kontaktaufnahme
          </h2>
          <p className="mt-2">
            (1) Durch das Absenden einer Anfrage über die Plattform erklärt sich
            der Interessent damit einverstanden, dass seine Kontaktdaten (Name,
            E-Mail, Telefon) an relevante Büroanbieter weitergeleitet werden.
          </p>
          <p className="mt-2">
            (2) NextOffice wird sich bemühen, innerhalb von 24 Stunden auf
            Anfragen zu reagieren. Eine Garantie für die Reaktionszeit besteht
            nicht.
          </p>
          <p className="mt-2">
            (3) Ein Miet- oder Nutzungsvertrag kommt ausschließlich zwischen dem
            Interessenten und dem jeweiligen Büroanbieter zustande. NextOffice
            ist nicht Vertragspartei.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 4 Pflichten des Nutzers
          </h2>
          <p className="mt-2">
            (1) Der Nutzer verpflichtet sich, bei der Nutzung der Plattform
            wahrheitsgemäße und vollständige Angaben zu machen.
          </p>
          <p className="mt-2">
            (2) Die Nutzung der Plattform zu rechtswidrigen oder
            missbräuchlichen Zwecken ist untersagt. Dazu gehört insbesondere das
            automatisierte Auslesen von Daten (Scraping) sowie das Einstellen
            von irreführenden oder falschen Anfragen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 5 Haftung
          </h2>
          <p className="mt-2">
            (1) NextOffice haftet unbeschränkt für Schäden, die auf einer
            vorsätzlichen oder grob fahrlässigen Pflichtverletzung beruhen.
          </p>
          <p className="mt-2">
            (2) Bei einfacher Fahrlässigkeit haftet NextOffice nur bei
            Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) und
            nur in Höhe des vorhersehbaren, typischerweise eintretenden
            Schadens.
          </p>
          <p className="mt-2">
            (3) NextOffice haftet nicht für die Richtigkeit, Vollständigkeit
            oder Aktualität der von Drittanbietern bereitgestellten
            Informationen zu Büroflächen.
          </p>
          <p className="mt-2">
            (4) Die Haftung nach dem Produkthaftungsgesetz sowie für Schäden aus
            der Verletzung von Leben, Körper oder Gesundheit bleibt unberührt.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 6 Datenschutz
          </h2>
          <p className="mt-2">
            Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{" "}
            <a href="/datenschutz" className="text-primary hover:underline">
              Datenschutzerklärung
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 7 Änderungen der AGB
          </h2>
          <p className="mt-2">
            (1) NextOffice behält sich vor, diese AGB jederzeit mit Wirkung für
            die Zukunft zu ändern.
          </p>
          <p className="mt-2">
            (2) Die jeweils aktuelle Fassung der AGB ist auf der Plattform
            einsehbar.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            § 8 Schlussbestimmungen
          </h2>
          <p className="mt-2">
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter
            Ausschluss des UN-Kaufrechts.
          </p>
          <p className="mt-2">
            (2) Gerichtsstand ist Hamburg, sofern der Nutzer Kaufmann,
            juristische Person des öffentlichen Rechts oder
            öffentlich-rechtliches Sondervermögen ist.
          </p>
          <p className="mt-2">
            (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
            werden, wird die Wirksamkeit der übrigen Bestimmungen davon nicht
            berührt.
          </p>
          <p className="mt-2">Stand: Februar 2026</p>
        </section>
      </div>
    </div>
  );
}
