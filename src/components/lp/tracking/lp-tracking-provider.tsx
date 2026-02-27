"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * LP-specific tracking context.
 *
 * Reads UTM parameters AND Google Ads click IDs from the URL on mount.
 * Persists them to sessionStorage so attribution survives within-session
 * navigation (e.g., from LP page to /danke thank-you page).
 *
 * Priority: URL params win over sessionStorage — fresh landing always
 * overwrites stored attribution.
 *
 * This is separate from the main site's TrackingProvider because:
 * - LP pages don't use the (main) layout
 * - LP tracking captures UTM params which the main provider doesn't
 * - sessionStorage persistence is needed for cross-page attribution
 */

export interface LPTrackingData {
  // UTM params
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  // Google Ads click IDs
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  // Page context
  landing_page: string | null;
  referrer: string | null;
}

const empty: LPTrackingData = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  gclid: null,
  gbraid: null,
  wbraid: null,
  landing_page: null,
  referrer: null,
};

const SESSION_KEY = "_no_lp_tracking";

const LPTrackingContext = createContext<LPTrackingData>(empty);

export function useLPTracking(): LPTrackingData {
  return useContext(LPTrackingContext);
}

export function LPTrackingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LPTrackingData>(empty);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Read UTM params from URL
    const utm_source = params.get("utm_source");
    const utm_medium = params.get("utm_medium");
    const utm_campaign = params.get("utm_campaign");
    const utm_term = params.get("utm_term");
    const utm_content = params.get("utm_content");

    // Read Google Ads click IDs from URL
    const gclid = params.get("gclid");
    const gbraid = params.get("gbraid");
    const wbraid = params.get("wbraid");

    const hasUrlParams =
      utm_source || utm_medium || utm_campaign || utm_term || utm_content ||
      gclid || gbraid || wbraid;

    if (hasUrlParams) {
      // URL params present — build fresh tracking data and persist to session
      const fresh: LPTrackingData = {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        gclid,
        gbraid,
        wbraid,
        landing_page: window.location.href,
        referrer: document.referrer || null,
      };
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
      } catch {
        // sessionStorage may be unavailable (private browsing restrictions)
      }
      setData(fresh);
    } else {
      // No URL params — try to restore from sessionStorage
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as LPTrackingData;
          setData(parsed);
        }
      } catch {
        // sessionStorage unavailable or corrupted — stay with empty defaults
      }
    }
  }, []);

  return (
    <LPTrackingContext.Provider value={data}>
      {children}
    </LPTrackingContext.Provider>
  );
}
