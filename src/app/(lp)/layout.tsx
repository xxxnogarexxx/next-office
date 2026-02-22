import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | NextOffice",
    default: "NextOffice",
  },
};

/**
 * LP route group layout.
 *
 * Intentionally minimal — no Header, no Footer, no TrackingProvider.
 * LP pages have full control over their own layout and chrome.
 */
export default function LPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1">{children}</main>;
}
