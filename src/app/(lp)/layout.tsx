import type { Metadata } from "next";
import { LPFooter } from "@/components/lp/lp-footer";

export const metadata: Metadata = {
  title: {
    template: "%s | NextOffice",
    default: "NextOffice",
  },
};

/**
 * LP route group layout.
 *
 * Intentionally minimal — no Header, no TrackingProvider.
 * LP pages have full control over their own content.
 * Footer is included for legal compliance (Impressum + Datenschutz).
 *
 * Uses min-h-screen flex flex-col so the footer stays at the bottom
 * regardless of page content height.
 */
export default function LPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <LPFooter />
    </div>
  );
}
