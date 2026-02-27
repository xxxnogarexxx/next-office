import Link from "next/link";

const footerLinks = {
  Städte: [
    { href: "/berlin", label: "Büro Berlin" },
    { href: "/muenchen", label: "Büro München" },
    { href: "/hamburg", label: "Büro Hamburg" },
    { href: "/frankfurt", label: "Büro Frankfurt" },
  ],
  Unternehmen: [
    { href: "/ueber-uns", label: "Über uns" },
    { href: "/fuer-anbieter", label: "Für Anbieter" },
    { href: "/blog", label: "Ratgeber" },
    { href: "/contact", label: "Kontakt" },
  ],
  Rechtliches: [
    { href: "/datenschutz", label: "Datenschutz" },
    { href: "/impressum", label: "Impressum" },
    { href: "/agb", label: "AGB" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-0.5">
              <span className="text-xl font-normal tracking-tight">Next</span>
              <span className="text-xl font-bold tracking-tight">Office</span>
            </Link>
            <p className="mt-3 text-sm text-body">
              Finden Sie das perfekte Büro für Ihr Unternehmen. Kostenlose
              Beratung, beste Preise.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-body transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-text">
          © {new Date().getFullYear()} NextOffice. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
