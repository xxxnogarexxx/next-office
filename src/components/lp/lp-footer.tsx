import Link from "next/link"

/**
 * LP legal footer — ultra-minimal.
 *
 * Displays only the required legal links (Impressum + Datenschutz)
 * with a copyright line. No navigation, no social links, no distractions.
 * Every LP page must include this footer for legal compliance.
 *
 * Server component — no "use client".
 */
export function LPFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      data-slot="lp-footer"
      className="border-t border-border py-4 px-4"
    >
      <p className="text-center text-xs text-muted-foreground">
        <Link
          href="/impressum"
          className="hover:underline hover:text-foreground transition-colors"
        >
          Impressum
        </Link>
        <span className="mx-2" aria-hidden="true">·</span>
        <Link
          href="/datenschutz"
          className="hover:underline hover:text-foreground transition-colors"
        >
          Datenschutz
        </Link>
        <span className="mx-3" aria-hidden="true">|</span>
        <span>© {year} NextOffice</span>
      </p>
    </footer>
  )
}
