import type { Metadata } from "next";
import { LPFooter } from "@/components/lp/lp-footer";
import { GTMScript } from "@/components/lp/tracking/gtm-script";
import { LPTrackingProvider } from "@/components/lp/tracking/lp-tracking-provider";

export const metadata: Metadata = {
  title: {
    template: "%s | NextOffice",
    default: "NextOffice",
  },
};

/**
 * LP route group layout.
 *
 * Intentionally minimal — no Header, no main site TrackingProvider.
 * LP pages have full control over their own content.
 * Footer is included for legal compliance (Impressum + Datenschutz).
 *
 * GTMScript: loads GA4 + Google Ads tracking scripts on all LP pages.
 * LPTrackingProvider: captures UTM params + click IDs, persists to sessionStorage
 * so attribution survives navigation from LP page → danke page.
 *
 * LPTrackingProvider is "use client" but wrapping server-rendered children
 * is valid in Next.js — server components passed as children are fine.
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
      <GTMScript />
      <LPTrackingProvider>
        <main className="flex-1">{children}</main>
      </LPTrackingProvider>
      <LPFooter />
    </div>
  );
}
