import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TrackingProvider } from "@/components/tracking-provider";
import { GTMScript } from "@/components/lp/tracking/gtm-script";

/**
 * Main site layout.
 *
 * Wraps all routes in the `(main)` group with the shared
 * Header and Footer. Identical to the old root layout chrome.
 *
 * GTMScript fires GA4 page_view on every main site page load (SEO-01).
 * Renders nothing when NEXT_PUBLIC_GA4_ID is unset (graceful degradation).
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GTMScript />
      <TrackingProvider>
        <div className="overflow-x-clip">
          <Header />
          <main suppressHydrationWarning>{children}</main>
          <Footer />
        </div>
      </TrackingProvider>
    </>
  );
}
