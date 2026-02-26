import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://next-office.io/datenschutz",
  },
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

      <div className="mt-8 space-y-8 text-sm text-body leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            1. Verantwortlicher
          </h2>
          <p className="mt-2">
            Verantwortlicher im Sinne der DSGVO:
          </p>
          <p className="mt-2">
            softurio UG (haftungsbeschränkt)
            <br />
            Schopenstehl 13, Haus am Domplatz
            <br />
            20095 Hamburg
            <br />
            E-Mail: info@next-office.io
            <br />
            Telefon: +49 30 200042000
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            2. Erhebung und Speicherung personenbezogener Daten
          </h2>
          <p className="mt-2">
            Beim Besuch unserer Website werden automatisch folgende Daten
            erhoben, die technisch erforderlich sind, um Ihnen unsere Website
            anzuzeigen:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>IP-Adresse</li>
            <li>Datum und Uhrzeit der Anfrage</li>
            <li>Zeitzonendifferenz zur Greenwich Mean Time (GMT)</li>
            <li>Inhalt der Anforderung (konkrete Seite)</li>
            <li>Zugriffsstatus/HTTP-Statuscode</li>
            <li>Jeweils übertragene Datenmenge</li>
            <li>Website, von der die Anforderung kommt</li>
            <li>Browser, Betriebssystem und dessen Oberfläche</li>
            <li>Sprache und Version der Browsersoftware</li>
          </ul>
          <p className="mt-2">
            Rechtsgrundlage ist Art. 6 Abs. 1 S. 1 lit. f DSGVO. Unser
            berechtigtes Interesse liegt in der Sicherstellung der
            Funktionsfähigkeit unserer Website.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            3. Kontaktformular und Anfragen
          </h2>
          <p className="mt-2">
            Wenn Sie uns über unser Kontaktformular oder per E-Mail
            kontaktieren, werden die von Ihnen angegebenen Daten (Name,
            E-Mail-Adresse, Telefonnummer, Teamgröße, gewünschter
            Einzugstermin, Stadt, Nachricht) zur Bearbeitung Ihrer Anfrage
            gespeichert. Diese Daten werden an relevante Büroanbieter
            weitergeleitet, um Ihnen passende Angebote unterbreiten zu können.
          </p>
          <p className="mt-2">
            Rechtsgrundlage ist Art. 6 Abs. 1 S. 1 lit. b DSGVO (Vertragsanbahnung)
            und Art. 6 Abs. 1 S. 1 lit. a DSGVO (Einwilligung).
          </p>
          <p className="mt-2">
            Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes
            ihrer Erhebung nicht mehr erforderlich sind. Dies ist in der Regel
            der Fall, wenn die jeweilige Anfrage abschließend bearbeitet wurde
            und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            4. Cookies
          </h2>
          <p className="mt-2">
            Unsere Website verwendet Cookies. Cookies sind kleine Textdateien,
            die im Internetbrowser bzw. vom Internetbrowser auf dem
            Computersystem eines Nutzers gespeichert werden. Die meisten der von
            uns verwendeten Cookies sind sogenannte „Session-Cookies“, die nach
            Ende Ihres Besuchs automatisch gelöscht werden. Andere Cookies
            bleiben auf Ihrem Endgerät gespeichert, bis Sie diese löschen.
          </p>
          <p className="mt-2">
            Sie können Ihren Browser so einstellen, dass Sie über das Setzen von
            Cookies informiert werden und Cookies nur im Einzelfall erlauben.
            Bei der Deaktivierung von Cookies kann die Funktionalität unserer
            Website eingeschränkt sein.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            5. Analyse-Tools
          </h2>
          <p className="mt-2">
            Wir verwenden ggf. Webanalyse-Dienste zur statistischen Auswertung
            der Nutzung unserer Website. Die dabei erhobenen Daten werden
            anonymisiert oder pseudonymisiert verarbeitet. Rechtsgrundlage ist
            Art. 6 Abs. 1 S. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt
            in der Verbesserung unseres Angebots.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            6. Eingebundene Dienste Dritter
          </h2>
          <p className="mt-2">
            Unsere Website nutzt Kartenmaterial von Mapbox. Beim Aufrufen
            einer Seite mit eingebetteter Karte wird eine Verbindung zu den
            Servern von Mapbox hergestellt. Dabei kann Ihre IP-Adresse
            übertragen werden. Weitere Informationen finden Sie in der
            Datenschutzerklärung von Mapbox unter https://www.mapbox.com/legal/privacy.
          </p>
          <p className="mt-2">
            Wir verwenden Bilder von Unsplash. Beim Laden der Bilder wird eine
            Verbindung zu den Servern von Unsplash hergestellt.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            7. Ihre Rechte
          </h2>
          <p className="mt-2">Sie haben gegenüber uns folgende Rechte:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            <li>
              Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)
            </li>
          </ul>
          <p className="mt-2">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:
            info@next-office.io
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            8. Aufbewahrungsfristen
          </h2>
          <p className="mt-2">
            Sofern nicht anders angegeben, speichern wir personenbezogene Daten
            nur so lange, wie es zur Erfüllung des jeweiligen Zwecks
            erforderlich ist. Gesetzliche Aufbewahrungspflichten (z.B.
            handelsrechtliche und steuerrechtliche Aufbewahrungspflichten von 6
            bzw. 10 Jahren) bleiben unberührt.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            9. Änderungen dieser Datenschutzerklärung
          </h2>
          <p className="mt-2">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
            sie stets den aktuellen rechtlichen Anforderungen entspricht oder um
            Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch
            gilt dann die neue Datenschutzerklärung.
          </p>
          <p className="mt-2">Stand: Februar 2026</p>
        </section>
      </div>
    </div>
  );
}
