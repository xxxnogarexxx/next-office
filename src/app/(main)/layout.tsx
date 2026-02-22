import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TrackingProvider } from "@/components/tracking-provider";

/**
 * Main site layout.
 *
 * Wraps all routes in the `(main)` group with the shared
 * Header and Footer. Identical to the old root layout chrome.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrackingProvider>
      <div className="overflow-x-clip">
        <Header />
        <main suppressHydrationWarning>{children}</main>
        <Footer />
      </div>
    </TrackingProvider>
  );
}
