"use client";

import { useEffect } from "react";

/**
 * Custom hook for scroll milestone and time-on-page tracking.
 *
 * Scroll milestones (TRACK-04): fires gtag events at 25%, 50%, 75%, 100% scroll depth.
 * Time-on-page (TRACK-04): fires gtag events at 30s, 60s, 120s, 300s.
 *
 * Both use a Set to ensure each milestone fires only once per page load.
 * Both are guarded by typeof window.gtag === 'function' — safe when gtag.js
 * hasn't loaded yet (e.g., dev environment, slow connections).
 *
 * Uses { passive: true } scroll listener to avoid blocking the main thread.
 * Throttles scroll handler via timestamp (200ms) to reduce event frequency.
 */
export function useScrollTracking() {
  useEffect(() => {
    // -------------------------
    // Scroll milestone tracking
    // -------------------------
    const SCROLL_MILESTONES = [25, 50, 75, 100];
    const firedScrollMilestones = new Set<number>();
    let lastScrollTime = 0;

    function handleScroll() {
      const now = Date.now();
      if (now - lastScrollTime < 200) return; // throttle: 200ms
      lastScrollTime = now;

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const percent = Math.round(
        ((window.scrollY + window.innerHeight) /
          document.documentElement.scrollHeight) *
          100
      );

      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !firedScrollMilestones.has(milestone)) {
          firedScrollMilestones.add(milestone);
          if (typeof window !== "undefined" && typeof window.gtag === "function") {
            window.gtag("event", "scroll_milestone", {
              event_category: "engagement",
              percent: milestone,
              non_interaction: true,
            });
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    // -------------------
    // Time-on-page events
    // -------------------
    const TIME_MILESTONES = [30, 60, 120, 300]; // seconds
    const firedTimeMilestones = new Set<number>();
    const startTime = Date.now();

    const timeInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      for (const seconds of TIME_MILESTONES) {
        if (elapsed >= seconds && !firedTimeMilestones.has(seconds)) {
          firedTimeMilestones.add(seconds);
          if (typeof window !== "undefined" && typeof window.gtag === "function") {
            window.gtag("event", "time_on_page", {
              event_category: "engagement",
              seconds,
              non_interaction: true,
            });
          }
        }
      }
    }, 5000); // check every 5 seconds (accurate enough, cheap)

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timeInterval);
    };
  }, []);
}

/**
 * Track a CTA button click with a descriptive label.
 *
 * Call this in onClick handlers on LP CTA buttons to track engagement.
 * Safe to call when gtag.js is not loaded — guards internally.
 *
 * @param label - Descriptive label for the CTA (e.g., "hero_cta", "sticky_cta")
 */
export function trackCTAClick(label: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "cta_click", {
      event_category: "engagement",
      event_label: label,
    });
  }
}
