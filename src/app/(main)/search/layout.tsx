import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Büros finden – Alle Office Spaces in Deutschland",
  description:
    "Durchsuchen Sie alle verfügbaren Büros und Office Spaces in Berlin, München, Hamburg und Frankfurt. Filter nach Größe, Preis und Ausstattung.",
  openGraph: {
    title: "Büros finden – Alle Office Spaces in Deutschland",
    description:
      "Durchsuchen Sie alle verfügbaren Büros und Office Spaces in Berlin, München, Hamburg und Frankfurt.",
    type: "website",
    url: "https://next-office.io/search",
  },
  alternates: {
    canonical: "https://next-office.io/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
