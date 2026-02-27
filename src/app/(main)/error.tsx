"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-semibold text-foreground">
        Ein Fehler ist aufgetreten
      </h2>

      <p className="mt-3 max-w-md text-sm text-body">
        Bitte versuchen Sie es erneut oder kontaktieren Sie uns.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-white hover:bg-foreground/90"
        >
          Erneut versuchen
        </button>

        <Link
          href="/"
          className="text-sm text-body underline underline-offset-4 hover:text-foreground"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
