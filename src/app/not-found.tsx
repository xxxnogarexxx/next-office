import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-lg font-medium">
        <span>Next</span>
        <span className="font-bold">Office</span>
      </div>

      <h1 className="text-8xl font-bold text-foreground">404</h1>

      <h2 className="mt-4 text-2xl font-semibold text-foreground">
        Seite nicht gefunden
      </h2>

      <p className="mt-3 max-w-md text-sm text-body">
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-white hover:bg-foreground/90"
        >
          Zur Startseite
        </Link>

        <Link
          href="/search"
          className="text-sm text-body underline underline-offset-4 hover:text-foreground"
        >
          Alle Büros durchsuchen
        </Link>
      </div>
    </div>
  );
}
