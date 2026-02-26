"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * In-memory Google Ads click ID tracking (URL Passthrough).
 *
 * Reads gclid / gbraid / wbraid from the landing-page URL once and keeps them
 * in React state for the duration of the session. Nothing is written to
 * localStorage, cookies, or any other device storage — no TTDSG consent needed.
 */

interface TrackingData {
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  landing_page: string | null;
  referrer: string | null;
}

const empty: TrackingData = {
  gclid: null,
  gbraid: null,
  wbraid: null,
  landing_page: null,
  referrer: null,
};

const TrackingContext = createContext<TrackingData>(empty);

export function useTracking() {
  return useContext(TrackingContext);
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TrackingData>(empty);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get("gclid");
    const gbraid = params.get("gbraid");
    const wbraid = params.get("wbraid");

    if (gclid || gbraid || wbraid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state on mount
      setData({
        gclid,
        gbraid,
        wbraid,
        landing_page: window.location.href,
        referrer: document.referrer || null,
      });
    }
  }, []);

  return (
    <TrackingContext.Provider value={data}>
      {children}
    </TrackingContext.Provider>
  );
}
