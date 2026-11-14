/**
 * Canonical identity of the site, for metadata and structured data.
 * ----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *
 * `metadataBase`, the JSON-LD `url`/`logo`, the sitemap and robots.txt all need
 * to agree on one absolute origin. They previously hard-coded
 * `https://altivance.com` — which is NOT this project's domain. It belongs
 * to an unrelated third party (217.160.0.233). This project's domain is
 * `altivance.com.ng`. The practical effect was that every
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
 *   3. `URL` — Netlify's equivalent of the above: the site's main address,
 *      custom domain included. Unlike the Vercel vars it already carries a
 *      scheme, which `toOrigin()` below accounts for.
 *   4. `VERCEL_URL` — the per-deployment hostname. Last resort on Vercel.
 *   5. `DEPLOY_PRIME_URL` — the per-deploy URL on Netlify.
 *   6. `http://localhost:3000` — development.
 *
 * Steps 3 and 5 exist because NOTHING on Netlify sets the `VERCEL_*` vars. On
 * Netlify without them this function fell through to `http://localhost:3000`,
 * which would have shipped `<link rel="canonical" href="http://localhost:3000/…">`
 * and a localhost `og:image` to production — the same class of silent, only-
 * visible-to-crawlers failure described above, reintroduced by the move off
 * Vercel. Setting `NEXT_PUBLIC_SITE_URL` also covers it; this is the backstop
 * for forgetting to.
 *
 * Note this is NOT the same job as `resolveOrigin()` in `site-url.ts`. That one
 * answers "where is the visitor right now?" per request, for Paystack callback
 * URLs. This one answers "what is this site's canonical address?" — a build-time
 * constant, because `metadataBase` and `sitemap.ts` have no request to read.
 */

/**
 * Normalise a host-provided value to an absolute origin.
 *
 * The two platforms disagree on format and it is easy to get wrong:
 *   Vercel   `VERCEL_PROJECT_PRODUCTION_URL` = `apex.vercel.app`   (bare host)
 *   Netlify  `URL`                           = `https://x.netlify.app` (scheme)
 *
 * Prefixing `https://` unconditionally would produce `https://https://…`, so
 * a value that already carries a scheme is passed through untouched.
 */
function toOrigin(value: string | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function fromEnv(): string {
  // 1. The deliberate override. Always wins, on any host.
  const explicit = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit;

  // 2. Stable production domain. Vercel, then Netlify.
  //    Both survive redeploys, so previews emit production-correct canonicals.
  const stable =
    toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toOrigin(process.env.URL);
  if (stable) return stable;

  // 3. Per-deployment hostname. Last resort before localhost.
  const perDeploy =
    toOrigin(process.env.VERCEL_URL) ??
    toOrigin(process.env.DEPLOY_PRIME_URL);
  if (perDeploy) return perDeploy;

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
