/**
 * Canonical identity of the site, for metadata and structured data.
 * ----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *
 * `metadataBase`, the JSON-LD `url`/`logo`, the sitemap and robots.txt all need
 * to agree on one absolute origin. They previously hard-coded
 * `https://altivance.com` — a domain that resolves to a different host
 * (217.160.0.233, not this deployment). The practical effect was that every
 * absolute URL Next generated pointed somewhere that does not serve this site:
 *
 *   https://altivance.com/og-image.jpg  ->  HTTP 404
 *
 * Social crawlers fetch `og:image` as an absolute URL, so pasting a link to
 * this site anywhere — WhatsApp, X, Facebook, LinkedIn, Slack, iMessage —
 * produced a preview with no image at all. Nothing in the app surfaced that;
 * it only shows up in the scraper.
 *
 * RESOLUTION ORDER
 *   1. `NEXT_PUBLIC_SITE_URL` — the deliberate override. Set this once a real
 *      domain is attached and pointed at this deployment.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — the project's stable production
 *      domain, injected by Vercel at build time. Survives every redeploy, so
 *      previews and production both emit production-correct canonicals.
 *   3. `VERCEL_URL` — the per-deployment hostname. Last resort on Vercel.
 *   4. `http://localhost:3000` — development.
 *
 * Note this is NOT the same job as `resolveOrigin()` in `site-url.ts`. That one
 * answers "where is the visitor right now?" per request, for Paystack callback
 * URLs. This one answers "what is this site's canonical address?" — a build-time
 * constant, because `metadataBase` and `sitemap.ts` have no request to read.
 */

function fromEnv(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction}`;

  const vercelDeployment = process.env.VERCEL_URL?.trim();
  if (vercelDeployment) return `https://${vercelDeployment}`;

  return "http://localhost:3000";
}

/** Absolute origin, no trailing slash. */
export const SITE_URL = fromEnv().replace(/\/+$/, "");

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "Altivance Academic Consultancy";
export const SITE_SHORT_NAME = "Altivance";
export const SITE_TAGLINE = "Where Academic Excellence Meets Results";

export const SITE_DESCRIPTION =
  "Nigeria's premier academic consultancy. Expert project writing, editing, proofreading, research assistance, data analysis, scholarship and study abroad guidance for students and professionals.";

export const CONTACT_PHONE = "+234-708-432-1204";
export const CONTACT_WHATSAPP = "https://wa.me/2347084321204";

/** Brand palette, mirrored from globals.css for use where CSS cannot reach. */
export const BRAND = {
  crimson: "#630303",
  crimsonBright: "#b30f0f",
  gold: "#d8a94a",
  goldSoft: "#f0cf8a",
  ink: "#120000",
} as const;
