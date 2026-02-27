import Script from "next/script";

/**
 * GTM/GA4 script injection component.
 *
 * Renders the Google Tag Manager / gtag.js script tags for LP pages.
 * Loaded in the LP layout so every LP page gets analytics tracking.
 *
 * Uses environment variables:
 * - NEXT_PUBLIC_GA4_ID: GA4 Measurement ID (e.g., "G-XXXXXXXX")
 * - NEXT_PUBLIC_GTM_ID: GTM Container ID (e.g., "GTM-XXXXXXX") — optional
 * - NEXT_PUBLIC_GOOGLE_ADS_ID: Google Ads Account ID (e.g., "AW-XXXXXXXXXX")
 *
 * Renders nothing when env vars are not set (graceful degradation for dev/staging).
 *
 * Enhanced Conversions (EC-01): allow_enhanced_conversions is set to true on the
 * Google Ads config call. This enables Google Ads to use hashed customer data
 * (email hash stored in leads.email_hash) for cross-device attribution.
 * The GA4 config does NOT get this flag — it is Google Ads-specific.
 */

const gaId = process.env.NEXT_PUBLIC_GA4_ID;
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function GTMScript() {
  // Render nothing if no tracking IDs are configured
  if (!gaId && !googleAdsId) {
    return null;
  }

  const activeId = gaId || googleAdsId!;

  return (
    <>
      {/* Load gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${activeId}`}
        strategy="lazyOnload"
      />

      {/* Configure gtag with GA4 and optionally Google Ads */}
      <Script
        id="gtag-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${gaId ? `gtag('config', '${gaId}');` : ""}
            ${googleAdsId ? `gtag('config', '${googleAdsId}', { allow_enhanced_conversions: true });` : ""}
          `,
        }}
      />
    </>
  );
}
