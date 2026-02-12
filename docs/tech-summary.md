# NextOffice — Tech Summary

**Stack:** Next.js 16 (React) + Tailwind CSS + Vercel. Kein WordPress, kein Page Builder, kein Plugin-Chaos. Alles custom, alles Code, alles unter Kontrolle.

## Warum das überlegen ist

- **Next.js** — Das Framework hinter Vercel, TikTok, Netflix, Notion. Server-Side Rendering + Static Generation = schnellste Ladezeiten + perfektes SEO out of the box
- **Vercel** — Auto-Deploy bei jedem Git Push. Kein FTP, kein Staging-Server, kein manuelles Deployment. Push to GitHub → 60 Sekunden später live
- **Tailwind CSS + shadcn/ui** — Kein CSS-Override-Chaos wie bei WordPress Themes. Jedes Pixel ist bewusst gesetzt
- **TypeScript** — Typsicherheit, weniger Bugs, bessere Wartbarkeit
- **Leaflet Maps** — Interaktive Karten ohne Google Maps API-Kosten
- **100% Custom** — Keine 47 Plugins die sich gegenseitig breaken. Kein Update-Roulette. Kein "funktioniert nach dem Update nicht mehr"

## Was bereits funktioniert

- Homepage mit Städte-Übersicht und Suchleiste
- 4 Städte (Berlin, München, Hamburg, Frankfurt) mit je 5 Listings
- Interaktive Karte mit Pins pro Stadt
- Listing-Detailseiten mit Fotogalerie, Karte, Ausstattung, Angebote
- Lead-Formulare (Sidebar, Mobile Sticky Bar, Kontaktseite)
- Blog-System (Markdown-basiert, kein CMS nötig)
- Vollständiges SEO: Meta-Tags, JSON-LD Schema, Sitemap, robots.txt
- Impressum, Datenschutz, AGB
- Mobile-optimiert, responsive Design
- Custom Favicon, eigene Domain (next-office.io)

## Was noch NICHT funktioniert (nur UI-Attrappe)

- **Filter** (Alle Preise, Teamgröße, Ausstattung, Sofort verfügbar) — Buttons sind da, tun aber nichts
- **Formulare** — Zeigen "Anfrage gesendet", speichern aber keine Daten und senden keine E-Mails
- **Angebot auswählen** (Sidebar-Dropdown) — Auswahl hat keinen Effekt
- **"Angebot wählen" Buttons** — Öffnen nur das Kontaktformular, gewähltes Angebot wird nicht übergeben
- **Städte-Zahlen auf der Homepage** (48, 35, 29, 22 Büros) — Platzhalter, real sind es je 5
- **Suche** — Funktioniert nur als Stadt-Navigation, keine echte Volltextsuche
- **Blog** — Nur 3 Platzhalter-Artikel
- **Footer-Links** "Über uns" und "Für Anbieter" — führen zu 404

## Was als Nächstes kommt

- **Supabase** als Backend (PostgreSQL Datenbank für Leads + Listings)
- **Formulare live schalten** (Daten speichern + E-Mail-Benachrichtigungen)
- **Echte Listings** importieren (z.B. aus Coworkingguide-Datenbank)
- **Filter-Logik** implementieren (Preis, Teamgröße, Ausstattung)
- **Analytics** (Google Analytics oder Plausible)
- **Cookie Consent Banner** (DSGVO-Pflicht)
- **Error Monitoring** (Sentry)

## Fazit

WordPress-Seite für so ein Projekt = Frankenstein aus 30 Plugins, langsam, SEO-Krücken, jedes Update ein Risiko. Hier: ein sauberer Codebase, blitzschnell, deployt sich selbst, skaliert auf Millionen Seitenaufrufe ohne Server-Tuning. Gleiche Infrastruktur wie die großen SaaS-Produkte.
