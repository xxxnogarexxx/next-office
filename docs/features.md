# NextOffice — Feature List

## Status-Legende
- [x] Live & funktioniert
- [~] UI vorhanden, Logik fehlt
- [ ] Noch nicht gebaut

---

## GO-LIVE BLOCKER

| # | Task | Bereich | Status |
|---|------|---------|--------|
| 1 | Echte Listings mit echten Daten (Adressen, Preise, Fotos, Anbieter) | Content | Offen |
| 2 | Texte anpassen (Hero, Beschreibungen, CTAs, Footer, Legal) | Content | Offen |
| 3 | Formulare testen (alle Varianten, E-Mail-Zustellung prüfen) | QA | Offen |
| 4 | Echte Filter-Logik (Preis, Teamgröße, Ausstattung) | Suche & Filter | Offen |
| 5 | Analytics einbinden (GA4 + Meta Pixel) | Infrastruktur | Offen |
| 6 | Google Search Console — Indexierung prüfen | SEO | Offen |
| 7 | Über uns Seite (`/about`) bauen | Seiten | Offen — aktuell 404 |

### Nice-to-have vor Launch (nicht blockierend)
- Für Anbieter Seite (`/for-providers`)
- Cookie Consent Banner (DSGVO)
- "Angebot wählen" — gewähltes Angebot ans Formular übergeben
- Impressum/Datenschutz Inhalt juristisch prüfen lassen

---

## Seiten

- [x] **Homepage** — Hero, Suchleiste, Städte-Karten, Value Props, Lead-Formular
- [x] **Homepage Mobile** — Zentriertes Layout, Bild + überlappendes Suchfeld (ShareSpace-Stil)
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
- [x] Custom Favicon

### Suche & Filter
- [x] Suchleiste mit Autocomplete (Stadt-Navigation)
- [x] Hero-Suchleiste — Mobile: Icon-Only Button, Desktop: "Suchen" Text
- [~] Filter-Buttons (Alle Preise, Teamgröße, Ausstattung, Sofort verfügbar) — nur UI
- [ ] Echte Filter-Logik (Preis-Range, Kapazität, Ausstattung)
- [ ] Volltextsuche über alle Listings
- [ ] Sortierung (Preis, Größe, Relevanz)

### Karten (Mapbox GL)
- [x] Mapbox GL JS mit react-map-gl v7 (Premium-Kartenstil light-v11)
- [x] Städte-/Such-Karte mit blauen Teardrop-Pins
- [x] Klickbare Popups mit Bild-Preview, Name, Adresse, Kapazität, Preis
- [x] Hover-Effekt auf Pins (dunkleres Blau, größerer Pin)
- [x] Scroll-Zoom mit Mausrad (wie Airbnb)
- [x] U-Bahn-Linien Overlay — farbige Polylines mit Hover-Tooltips (Liniennummer)
- [x] S-Bahn-Linien Overlay — farbige Polylines mit Hover-Tooltips (Liniennummer)
- [x] Separate Toggle-Buttons für U-Bahn / S-Bahn mit Linienanzahl
- [x] Listing-Detail-Karte (einzelner Pin)
- [x] POI-System auf Listing-Karten: U-Bahn, S-Bahn, Bus (Overpass API), Restaurants, Cafés, Parking (Mapbox)
- [x] POI Toggle-Buttons mit Anzahl + Entfernungsangaben
- [x] Mobile: "Karte anzeigen" Toggle-Button
- [x] Daten in localStorage gecacht (24h TTL)
- [ ] Cluster-Pins bei vielen Listings

### Listing-Karten (Grid)
- [x] Airbnb-Style Bilder-Karussell (Pfeile bei Hover, Dot-Indikatoren, Fade-Übergang)
- [x] Provider-Name, Listing-Name, Adresse, Kapazität, Preis, Amenities
- [x] Versteckter Scrollbalken auf Listing-Panels

### Listing-Detail
- [x] Foto-Galerie mit Fullscreen-Modus (6 Fotos pro Listing)
- [x] Key Facts (Adresse, Kapazität, Preis, Fläche, Kündigungsfrist)
- [x] Beschreibung
- [x] Verfügbare Angebote (Private Office, Suite)
- [x] Ausstattung mit Icons
- [x] Standort-Karte mit POI-System
- [x] Ähnliche Büros
- [x] Sticky Sidebar (Desktop) mit Anbieter-Info + CTA
- [x] Sticky Bottom Bar (Mobile) mit Preis + CTA
- [~] Angebots-Dropdown in Sidebar — Auswahl hat keinen Effekt
- [~] "Angebot wählen" — öffnet Formular, übergibt aber nicht welches Angebot

### Lead-Formulare
- [x] Sidebar-Formular (im Dialog)
- [x] Inline-Formular (Homepage)
- [x] Kontaktseiten-Formular (50/50 Split)
- [x] Felder: Name, E-Mail, Telefon, Teamgröße, Einzugsdatum, Stadt, Nachricht
- [x] Erfolgs-Bestätigung nach Absenden
- [x] MutationObserver gegen Passwort-Manager-Shaking
- [x] Backend-Anbindung (Supabase) — Leads in DB gespeichert
- [x] E-Mail-Benachrichtigung bei neuer Anfrage (Resend, noreply@next-office.io)
- [x] E-Mail zeigt: Arbeitsplätze, Einzugsdatum (DD.MM.YY), Stadt, Firmenname aus Domain
- [ ] Lead-Daten an CRM weiterleiten
- [ ] Auto-Reply E-Mail an den Anfragenden

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
- [x] 20 Listings mit realistischen Daten (Adressen, Koordinaten, Preise, Amenities, Kündigungsfrist)
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
- [x] Resend E-Mail (verifizierte Domain next-office.io)
- [x] Mapbox GL Token (Vercel Env Vars)
- [ ] Google Workspace Domain-Alias — @next-office.io als Alias in Google Workspace
- [ ] Analytics (GA4 + Meta Pixel)
- [ ] Cookie Consent Banner (DSGVO)
- [ ] Error Monitoring (Sentry)
- [ ] Uptime Monitoring

## Feature Backlog

### UX & Conversion
- [ ] **ESC-Taste für Foto-Galerie** — Fullscreen-Overlay schließen mit Escape
- [ ] **Chatbot** — KI-gestützter Chat (Fragen beantworten, Leads generieren)
- [ ] **Rückruf-Popup** — Nach X Sekunden: "Brauchen Sie Hilfe?" Popup
- [ ] **Heyflow-Funnel** — Step-by-Step Fragebogen (Teamgröße → Budget → Stadt → Kontaktdaten)
- [ ] **"Das passende Büro in 2 Minuten" CTA-Box** — Auf Städte-Seite nach den ersten 3 Listings

### Nice-to-Have (Zukunft)
- [ ] Anbieter-Dashboard (Listings verwalten)
- [ ] Nutzer-Accounts / Merkliste
- [ ] Bewertungen / Reviews
- [ ] Preisvergleich-Tool
- [ ] Virtuelle Touren (360-Grad)
- [ ] Multi-Language (EN für internationale Nutzer)
- [ ] A/B Testing für Conversion-Optimierung
- [ ] Stadtteile-Overlay auf Karte (vorbereitet, API existiert unter /api/districts)
