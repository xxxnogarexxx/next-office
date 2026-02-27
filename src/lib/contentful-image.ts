/**
 * Append Contentful Images API transform params to a ctfassets URL.
 * Returns non-Contentful URLs unchanged.
 */
export function contentfulImageUrl(
  url: string,
  opts: { w: number; h: number; q?: number },
): string {
  if (!url.includes("images.ctfassets.net")) return url;

  const { w, h, q = 75 } = opts;
  const base = url.split("?")[0]; // strip any existing params
  return `${base}?w=${w}&h=${h}&fit=fill&q=${q}&fm=webp`;
}
