# NextOffice — Feature List

## Status-Legende
- [x] Live & funktioniert
- [~] UI vorhanden, Logik fehlt
- [ ] Noch nicht gebaut

---

## GO-LIVE BLOCKER

| # | Task | Bereich | Status |
|---|------|---------|--------|
| 1 | Merge CSV mit capacityMin/Max + noticePeriod | Content | Offen — `spaces-to-fill.csv` an User gesendet |
| 2 | Auto-generierte "Über dieses Büro" Beschreibungen | Content | Offen — nach CSV-Merge |
| 3 | gclid Tracking Layer finalisieren | Tracking | In Arbeit — Code vorhanden, uncommitted |
| 4 | Cookie Consent Banner (DSGVO) | Legal | Offen |

### Nice-to-have vor Launch (nicht blockierend)
- Impressum/Datenschutz Inhalt juristisch prüfen lassen
- "Angebot wählen" — gewähltes Angebot ans Formular übergeben

---

## Seiten

- [x] **Homepage** — Hero mit Suchleiste, Trust-Logos (7 Kundenlogos), Städte-Karten, Testimonials, Lead-Formular
- [x] **Homepage Mobile** — Zentriertes Layout, Bild + überlappendes Suchfeld
- [x] **Städte-Suche** (`/berlin`, `/muenchen`, etc.) — Listing-Grid + interaktive Karte + Inline-CTA-Banner
- [x] **Listing-Detail** (`/berlin/spaces-potsdamer-platz`) — Fotos, Key Facts, Angebote, Ausstattung, POI-Karte, ähnliche Büros
- [x] **Kontakt** (`/contact`) — Conversion-optimiert: Trust-Stats, Formular, Benjamin-Karte mit Antwortzeit-Badge, Prozess-Stepper, Kundenlogos
- [x] **Über uns** (`/ueber-uns`) — Hero, Stats, Geschichte (CG + NextOffice), Werte, Benjamin-Karte, Testimonials, CTA
- [x] **Für Anbieter** (`/fuer-anbieter`) — Hero mit Features-Checkliste, 4 Benefits, 4-Schritte-Prozess, CTA mit Lead-Formular + Benjamin-Karte
- [x] **Blog-Index** (`/blog`) — Artikel-Übersicht
- [x] **Blog-Artikel** (`/blog/[slug]`) — Markdown-basiert mit CTA
- [x] **Impressum** (`/impressum`)
- [x] **Datenschutz** (`/datenschutz`)
- [x] **AGB** (`/agb`)
- [x] **Suche** (`/search`) — Alle Listings mit Karte
- [ ] **Stadtteile-Seiten** (z.B. `/berlin/kreuzberg`) — für SEO

## Komponenten & Features

### Navigation & Layout
- [x] Header (h-20, full-width) mit Logo (schwarzer Rahmen), "Schnellangebot"-Button
- [x] Mobile Hamburger-Menü — Sheet mit Logo-Header, Schnellangebot CTA, Unternehmen + Rechtliches Sections, große Tap-Targets
- [x] Footer mit Stadt-Links, Unternehmens-Links (Über uns, Für Anbieter), Rechtliches
- [x] Responsive Design (Mobile, Tablet, Desktop)
- [x] Custom Favicon

### Suche & Filter
- [x] Suchleiste mit Autocomplete (Stadt-Navigation)
- [x] Hero-Suchleiste — "Wo suchen Sie?" Label im Container, Mobile: Icon-Only Button, Desktop: "Suchen" Text
- [ ] Filter-Buttons + echte Filter-Logik (Preis-Range, Kapazität, Ausstattung) — UI entfernt, Komponente vorhanden
- [ ] Volltextsuche über alle Listings
- [ ] Sortierung (Preis, Größe, Relevanz)

### Karten (Mapbox GL)
- [x] Mapbox GL JS mit react-map-gl v7 (Premium-Kartenstil light-v11)
- [x] Städte-/Such-Karte mit blauen Teardrop-Pins (aktiver Pin schwarz + z-index)
- [x] Klickbare Popups mit Bild-Preview, Name, Adresse, Kapazität, Preis
- [x] Hover-Effekt auf Pins (dunkleres Blau, größerer Pin)
- [x] Scroll-Zoom mit Mausrad (wie Airbnb)
- [x] U-Bahn-Linien Overlay — farbige Polylines mit Hover-Tooltips (Liniennummer)
- [x] S-Bahn-Linien Overlay — farbige Polylines mit Hover-Tooltips (Liniennummer)
- [x] Stadtteile-Overlay — Boundary-Polygone (Overpass → GeoJSON layers)
- [x] Separate Toggle-Buttons für U-Bahn / S-Bahn mit Linienanzahl
- [x] Listing-Detail-Karte (einzelner Pin) — responsive (filters above, map below on mobile)
- [x] POI-System auf Listing-Karten: U-Bahn, S-Bahn, Bus (Overpass API), Restaurants, Cafés, Parking (Mapbox)
- [x] POI Toggle-Buttons mit Anzahl + Entfernungsangaben
- [x] Mobile: "Karte anzeigen" Toggle-Button (dvh mit 5rem Header-Offset)
- [x] ResizeObserver auf SearchMapInner — map.resize() bei Toggle (fix für weißen Bereich)
- [x] Daten in localStorage gecacht (24h TTL), retry + no-cache-on-error
- [x] Overpass API Proxy mit 12s Timeout + Error-Handling
- [ ] Cluster-Pins bei vielen Listings

### Listing-Karten (Grid)
- [x] Airbnb-Style Bilder-Karussell (Pfeile bei Hover, Dot-Indikatoren, Fade-Übergang)
- [x] Provider-Name, Listing-Name, Adresse, Kapazität, Preis, Amenities
- [x] Versteckter Scrollbalken auf Listing-Panels
- [x] Mobile Photo-Swipe
- [x] Inline-CTA-Banner nach 4. Listing — dunkles Design (gray-900), Benjamin-Foto, "Jetzt anfragen" Button, öffnet Lead-Popup

### Listing-Detail
- [x] Foto-Galerie mit Fullscreen-Modus (ESC schließt)
- [x] Key Facts (Adresse, Kapazität, Preis, Fläche, Kündigungsfrist)
- [x] Beschreibung
- [x] Verfügbare Angebote mit "Angebot erhalten" Buttons (schwarz, responsive Layout)
- [x] Enterprise Suite Angebot (auf allen Listings)
- [x] Ausstattung mit Icons
- [x] Standort-Karte mit POI-System
- [x] Ähnliche Büros
- [x] Sticky Sidebar (Desktop) — Preis, "Kostenloses Angebot erhalten" (blau), Urgency-Badge (amber), Trust-Signals (grün), Benjamin-Berater-Karte
- [x] Sticky Bottom Bar (Mobile) mit Preis + CTA
- [x] Lead-Popup (Dialog) — Trust-Strip (3 Punkte: kostenlos, 30 Min, Preisgarantie), Formular, Kundenlogos (Zalando/Canon/Fresenius), Benjamin-Footer mit 5 Sternen
- [~] Angebots-Dropdown in alter Sidebar — Auswahl hat keinen Effekt
- [~] "Angebot wählen" — öffnet Formular, übergibt aber nicht welches Angebot

### Trust & Social Proof
- [x] Homepage Trust-Logos: Zalando, Canon, Randstad, Fresenius, Sky, Gigaset, IDEO (grayscale, 40% Opacity)
- [x] Kontaktseite Kundenlogos: Zalando, Canon, Fresenius, Sky
- [x] Lead-Popup Kundenlogos: Zalando, Canon, Fresenius (grayscale)
- [x] Testimonials: 3 Kundenstimmen mit Zitat, Bürofoto, Avatar, Name/Rolle, Firmenlogo (grayscale)
- [x] "Über 1.000 Unternehmen" — konsistent auf allen Seiten
- [x] Kontaktseite: "Antwortzeit: unter 2 Stunden" Badge
- [x] Sidebar + Popup: "Antwort in unter 30 Min." Badge

### Lead-Formulare
- [x] Dialog-Formular (variant="dialog" — ohne Border/Padding/Header, für Popup)
- [x] Sidebar-Formular (variant="sidebar" — mit Border + "Jetzt anfragen" Header)
- [x] Inline-Formular (Homepage, Über uns, Für Anbieter)
- [x] Kontaktseiten-Formular (conversion-optimiert mit Trust-Elementen)
- [x] Felder: Name*, E-Mail*, Telefon*, Teamgröße*, Einzugsdatum*, Stadt*, Nachricht (optional)
- [x] Alle Felder required außer Nachricht (mit "(optional)" Label)
- [x] Erfolgs-Bestätigung nach Absenden
- [x] MutationObserver gegen Passwort-Manager-Shaking
- [x] Backend-Anbindung (Supabase) — Leads in DB gespeichert
- [x] E-Mail-Benachrichtigung bei neuer Anfrage (Resend, noreply@next-office.io → anfrage@coworkingguide.de)
- [x] E-Mail zeigt: Arbeitsplätze, Einzugsdatum (DD.MM.YY), Stadt, Firmenname aus Domain
- [~] gclid Tracking — Code vorhanden, noch nicht committed
- [ ] Lead-Daten an CRM weiterleiten
- [ ] Auto-Reply E-Mail an den Anfragenden

### SEO
- [x] Meta-Tags pro Seite (Title, Description, OG, Twitter)
- [x] JSON-LD Schema (LocalBusiness für Listings, Article für Blog)
- [x] Automatische Sitemap (`/sitemap.xml`) — alle Seiten inkl. Über uns, Für Anbieter
- [x] robots.txt
- [x] Canonical URLs
- [ ] Indexierung in Google Search Console prüfen

### Blog
- [x] Markdown-basierte Artikel (src/content/blog/)
- [x] Frontmatter (Titel, Beschreibung, Datum, Autor)
- [x] Prose-Styling mit Tailwind Typography
- [x] 3 Platzhalter-Artikel vorhanden
- [ ] Weitere Artikel schreiben (SEO-Keyword-basiert)
- [ ] Artikel-Kategorien / Tags

### Content
- [x] 264 echte Listings aus Contentful CMS (93 Berlin, 46 Hamburg, 42 München, 32 Frankfurt, 31 Köln, 20 Düsseldorf)
- [x] Fotos auf Contentful CDN (images.ctfassets.net)
- [x] 6 Städte mit Bildern
- [x] Import-Script (`scripts/import-contentful.ts`) — CG→NO Format-Transformation
- [x] Statische JSON-Daten (`src/data/listings.json`, `src/data/cities.json`)
- [x] Defaults: noticePeriod "ab 1 Monat", capacityMin=1, "1–50+ Personen" wenn kein Max

## Infrastruktur & Ops

- [x] Vercel Deployment (Auto-Deploy via GitHub)
- [x] Custom Domain (next-office.io)
- [x] SSL/HTTPS
- [x] Supabase Backend (PostgreSQL) — für Leads
- [x] Resend E-Mail (verifizierte Domain next-office.io)
- [x] Mapbox GL Token (Vercel Env Vars)
- [x] n8n Workflow: NetHunt → Google Sheets Conversion Upload (Qualified Lead + Closed Deal)
- [x] Dev Server: ~/Developer/next-office (aus iCloud verschoben wegen Crash-Probleme)
- [x] Stündliches Backup zu iCloud via launchd
- [ ] Google Workspace Domain-Alias — @next-office.io als Alias in Google Workspace
- [ ] Analytics (GA4 + Meta Pixel)
- [ ] Cookie Consent Banner (DSGVO)
- [ ] Error Monitoring (Sentry)
- [ ] Uptime Monitoring

## Bekannte Bugs

- [ ] **Layout-Shift bei Dialog auf City/Search-Seiten** — Radix Dialog entfernt Scrollbar, Map/Liste verschiebt sich ~1mm. Workarounds (scrollbar-gutter, padding-right !important) bisher wirkungslos.

## Feature Backlog

### Nächste Schritte
- [ ] **Auto-Sync Contentful → NO** — Contentful Webhook → Vercel Deploy Hook, Import-Script läuft bei Build. Script handhabt bereits CG→NO Transformation.
- [ ] **Echte Filter-Logik** — Preis-Range, Kapazität, Ausstattung auf Städte-/Suchseiten
- [ ] **Analytics** — GA4 + Meta Pixel nach Launch

### UX & Conversion
- [ ] **Bottom-of-List Kontaktformular** — Wenn User auf Städte-/Suchseite komplett runtergescrollt hat (alles gesehen, noch nicht kontaktiert), nochmal ein Kontaktformular/CTA anzeigen
- [ ] **"Weitere Büros" nur Partner anzeigen** — `isPartner` Feld in Listings, "Partner?" Spalte in CSV (`spaces-to-fill.csv` bereits vorbereitet), ähnliche Büros nur aus Partner-Pool
- [ ] **🔴 Chatbot (Lead-Qualifizierung)** — KI-gestützter Chat auf allen Seiten. Qualifiziert Leads (Stadt, Teamgröße, Budget, Zeitrahmen), beantwortet Fragen zu Listings, leitet qualifizierte Anfragen ans CRM weiter. Höchste Priorität im Backlog.
- [ ] **Rückruf-Popup** — Nach X Sekunden: "Brauchen Sie Hilfe?" Popup
- [ ] **Heyflow-Funnel** — Step-by-Step Fragebogen (Teamgröße → Budget → Stadt → Kontaktdaten)
- [x] **"Ihr Büro in {Stadt} — in 2 Minuten" CTA-Banner** — Auf Städte-Seite nach den ersten 4 Listings, dunkles Design

### Nice-to-Have (Zukunft)
- [ ] Anbieter-Dashboard (Listings verwalten)
- [ ] Nutzer-Accounts / Merkliste
- [ ] Bewertungen / Reviews
- [ ] Preisvergleich-Tool
- [ ] Virtuelle Touren (360-Grad)
- [ ] Multi-Language (EN für internationale Nutzer)
- [ ] A/B Testing für Conversion-Optimierung
- [ ] Stadtteile-Seiten für SEO
- [ ] Cluster-Pins bei vielen Listings
