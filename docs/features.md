# NextOffice — Feature List

## Status-Legende
- [x] Live & funktioniert
- [~] UI vorhanden, Logik fehlt
- [ ] Noch nicht gebaut

---

## PRIORITÄT — Top 10 (Ziel: voll funktionsfähige Website)

| # | Task | Bereich |
|---|------|---------|
| ~~1~~ | ~~Supabase Backend aufsetzen (PostgreSQL)~~ ✅ | Infrastruktur |
| ~~2~~ | ~~Formulare live schalten — Leads in DB speichern~~ ✅ | Lead-Formulare |
| ~~3~~ | ~~E-Mail-Benachrichtigung bei neuer Anfrage (Resend)~~ ✅ | Lead-Formulare |
| 4 | Cookie Consent Banner (DSGVO-Pflicht) | Infrastruktur |
| 5 | Analytics einbinden (Google Analytics / Plausible) | Infrastruktur |
| 6 | Google Search Console — Indexierung prüfen | SEO |
| 7 | Echte Filter-Logik (Preis, Teamgröße, Ausstattung) | Suche & Filter |
| 8 | "Angebot wählen" — gewähltes Angebot ans Formular übergeben | Listing-Detail |
| 9 | Über uns Seite (`/about`) bauen | Seiten |
| 10 | Mapbox GL Migration — POI-Daten (Metro, Restaurants, Parking, Cafés) auf Listing-Karten | Maps & Location |

> **Regel:** Maximal 10 Einträge. Wenn einer erledigt ist, rückt der nächste wichtigste Task nach.

---

## Seiten

- [x] **Homepage** — Hero, Suchleiste, Städte-Karten, Featured Listings
- [x] **Städte-Suche** (`/berlin`, `/muenchen`, etc.) — Listing-Grid + interaktive Karte
- [x] **Listing-Detail** (`/berlin/spaces-potsdamer-platz`) — Fotos, Key Facts, Angebote, Ausstattung, Karte, ähnliche Büros
- [x] **Kontakt** (`/contact`) — Formular + Info-Bereich
- [x] **Blog-Index** (`/blog`) — Artikel-Übersicht
- [x] **Blog-Artikel** (`/blog/[slug]`) — Markdown-basiert mit CTA
- [x] **Impressum** (`/impressum`)
- [x] **Datenschutz** (`/datenschutz`)
- [x] **AGB** (`/agb`)
- [~] **Suche** (`/search`) — Seite existiert, keine echte Suchlogik
- [ ] **Über uns** (`/about`) — 404
- [ ] **Für Anbieter** (`/for-providers`) — 404

## Komponenten & Features

### Navigation & Layout
- [x] Header mit Logo, "Büros finden"-Link, "Schnellangebot"-Button
- [x] Mobile Hamburger-Menü
- [x] Footer mit Stadt-Links, Unternehmens-Links, Rechtliches
- [x] Responsive Design (Mobile, Tablet, Desktop)
- [x] Custom Favicon (blaues N)

### Suche & Filter
- [x] Suchleiste mit Autocomplete (Stadt-Navigation)
- [~] Filter-Buttons (Alle Preise, Teamgröße, Ausstattung, Sofort verfügbar) — nur UI
- [ ] Echte Filter-Logik (Preis-Range, Kapazität, Ausstattung)
- [ ] Volltextsuche über alle Listings
- [ ] Sortierung (Preis, Größe, Relevanz)

### Karten
- [x] Städte-Karte mit blauen Teardrop-Pins
- [x] Klickbare Popups mit Listing-Info + Link
- [x] Hover-Effekt auf Pins (dunkleres Blau)
- [x] Listing-Detail-Karte (einzelner Pin)
- [x] Mobile: "Karte anzeigen" Toggle-Button
- [ ] Cluster-Pins bei vielen Listings

### Listing-Detail
- [x] Foto-Galerie mit Fullscreen-Modus (6 Fotos pro Listing)
- [x] Key Facts (Adresse, Kapazität, Preis, Fläche)
- [x] Beschreibung
- [x] Verfügbare Angebote (Private Office, Suite)
- [x] Ausstattung mit Icons
- [x] Standort-Karte
- [x] Ähnliche Büros
- [x] Sticky Sidebar (Desktop) mit Anbieter-Info + CTA
- [x] Sticky Bottom Bar (Mobile) mit Preis + CTA
- [~] Angebots-Dropdown in Sidebar — Auswahl hat keinen Effekt
- [~] "Angebot wählen" — öffnet Formular, übergibt aber nicht welches Angebot

### Lead-Formulare
- [x] Sidebar-Formular (im Dialog)
- [x] Kontaktseiten-Formular (50/50 Split)
- [x] Felder: Name, E-Mail, Telefon, Teamgröße, Einzugsdatum, Stadt, Nachricht
- [x] Erfolgs-Bestätigung nach Absenden
- [x] MutationObserver gegen Passwort-Manager-Shaking
- [x] Backend-Anbindung (Supabase) — Leads in DB gespeichert
- [x] E-Mail-Benachrichtigung bei neuer Anfrage (Resend)
- [ ] Lead-Daten an CRM weiterleiten

### SEO
- [x] Meta-Tags pro Seite (Title, Description, OG, Twitter)
- [x] JSON-LD Schema (LocalBusiness für Listings, Article für Blog)
- [x] Automatische Sitemap (`/sitemap.xml`)
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
- [x] 20 Listings mit realistischen Daten (Adressen, Koordinaten, Preise, Amenities)
- [x] 6 Fotos pro Listing (Unsplash)
- [x] 4 Städte mit Bildern
- [~] Listing-Zahlen auf Homepage (48, 35, 29, 22) — Fake, real je 5
- [ ] Echte Listings aus Coworkingguide-Datenbank importieren
- [ ] Echte Fotos von Anbietern
- [ ] Weitere Städte (Köln, Düsseldorf, Stuttgart, Wien, Zürich)

## Infrastruktur & Ops

- [x] Vercel Deployment (Auto-Deploy via GitHub)
- [x] Custom Domain (next-office.io)
- [x] SSL/HTTPS
- [x] Supabase Backend (PostgreSQL)
- [ ] Google Workspace Domain-Alias — @next-office.io als Alias in Google Workspace einrichten (E-Mails in bestehendem Postfach empfangen)
- [ ] Analytics (Google Analytics / Plausible)
- [ ] Cookie Consent Banner (DSGVO)
- [ ] Error Monitoring (Sentry)
- [ ] Uptime Monitoring
- [ ] Backups (Supabase auto)

## Feature Backlog

### UX & Conversion
- [ ] **ESC-Taste für Foto-Galerie** — Fullscreen-Overlay schließen mit Escape (aktuell nur X-Button oder Zurück)
- [ ] **Chatbot** — KI-gestützter Chat auf der Seite (Fragen beantworten, Leads generieren)
- [ ] **Rückruf-Popup** — Nach X Sekunden: "Wir rufen Sie zurück" / "Brauchen Sie Hilfe?" Popup
- [ ] **Heyflow-Funnel** — Step-by-Step Fragebogen (Teamgröße → Budget → Stadt → Ausstattung → Kontaktdaten), ähnlich wie Heyflow/Typeform
- [ ] **"Das passende Büro in 2 Minuten" CTA-Box** — Auf der Städte-Seite nach den ersten 3 Listings eingeblendet (dunkler Hintergrund, "Jetzt starten" Button → öffnet Funnel). Referenz: Coworkingguide

### Maps & Location
- [ ] **Mapbox GL Migration** — Leaflet-Tiles durch Mapbox ersetzen (Premium Look & Feel, kein Konkurrent hat das). POI-Daten (Bus, U-Bahn, Parking, Restaurants) auf Listing-Detail-Karten anzeigen. Sidebar mit Kategorie-Toggles + Entfernungsangaben

### Nice-to-Have (Zukunft)
- [ ] Anbieter-Dashboard (Listings verwalten)
- [ ] Nutzer-Accounts / Merkliste
- [ ] Bewertungen / Reviews
- [ ] Preisvergleich-Tool
- [ ] Virtuelle Touren (360-Grad)
- [ ] Multi-Language (EN für internationale Nutzer)
- [ ] A/B Testing für Conversion-Optimierung
