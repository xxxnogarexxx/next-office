"use client";

import { useEffect, useRef } from "react";

/**
 * Client component island for Google Ads conversion tracking on the thank-you page.
 *
 * Fires two events on mount:
 * 1. Google Ads conversion tag — connects ad spend to actual leads in Google Ads dashboard
 * 2. GA4 lp_form_complete event — tracks conversion in analytics funnel
 *
 * Uses a ref guard to ensure the conversion fires only once (React strict mode
 * fires useEffect twice in dev, which would double-count conversions).
 *
 * Reads gclid and transaction_id from sessionStorage (stored by LPTrackingProvider and
 * lead-form-section respectively) for attribution and deduplication.
 *
 * EC-04: Reuses the transaction_id from the form submission (stored by lead-form-section.tsx)
 * to deduplicate this conversion event against the one fired on form submit. Falls back to a
 * new UUID only when sessionStorage is unavailable.
 *
 * This is the primary conversion signal — Plan 02-03 fires on form submit (before redirect),
 * this fires on confirmed page load. Both share the same transaction_id to prevent double-counting.
 *
 * Environment variables required in production:
 * - NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: Google Ads Conversion ID (e.g., "AW-XXXXXXXXXX")
 * - NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL: Conversion label from Google Ads dashboard
 *
 * Renders nothing — this is a pure side-effect component.
 */
export function ConversionTracker() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    // Read gclid and transaction_id from sessionStorage.
    // gclid: set by LPTrackingProvider on initial LP landing.
    // transaction_id: set by lead-form-section.tsx on form submission (EC-04).
    let gclid: string | null = null;
    let transactionId: string | null = null;
    try {
      const stored = sessionStorage.getItem("_no_lp_tracking");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          gclid?: string | null;
          transaction_id?: string | null;
        };
        gclid = parsed.gclid ?? null;
        transactionId = parsed.transaction_id ?? null;
      }
    } catch {
      // sessionStorage unavailable — proceed without gclid/transactionId
    }

    const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

    // Reject placeholder env var values — prevents sending junk conversion data to Google Ads
    const isPlaceholder = (val: string | undefined) =>
      !val || /^[X]+$|^AW-X+$|XXXXXXXXXX|example|placeholder|test/i.test(val);

    // EC-04: Reuse transaction_id from form submission (stored in sessionStorage by lead-form-section).
    // Falls back to a new UUID if sessionStorage was unavailable.
    const deduplicationId = transactionId ?? crypto.randomUUID();

    // Fire Google Ads conversion tag if configured with real values
    if (conversionId && conversionLabel) {
      if (isPlaceholder(conversionId) || isPlaceholder(conversionLabel)) {
        console.warn(
          "[ConversionTracker] Skipping Google Ads conversion — env vars appear to be placeholders"
        );
      } else {
        window.gtag("event", "conversion", {
          send_to: `${conversionId}/${conversionLabel}`,
          value: 1.0,
          currency: "EUR",
          transaction_id: deduplicationId,
          gclid: gclid ?? undefined,
        });
      }
    }

    // Fire GA4 event — tracks confirmed conversion (page loaded) separately from submit attempt
    window.gtag("event", "lp_form_complete", {
      event_category: "conversion",
      event_label: "danke_page_load",
      gclid: gclid ?? undefined,
      transaction_id: deduplicationId,
    });
  }, []);

  // Renders nothing — pure side-effect component
  return null;
}
