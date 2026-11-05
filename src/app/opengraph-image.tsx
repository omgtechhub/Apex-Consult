import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BRAND, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

/**
 * The social preview card, generated at build time.
 * ----------------------------------------------------------------------------
 * WHY THIS REPLACED `public/og-image.jpg`
 *
 * The committed JPEG read "APEX ACADEMIC CONSULTANCY" — the previous name of
 * this business. Every other surface of the site says "Altivance" (79
 * references in src/, zero to "Apex Academic"), so the one asset that
 * represents the brand on WhatsApp, X, LinkedIn and Slack was the only one
 * still showing the old name. A static binary cannot be checked by the type
 * system or caught in review, which is exactly how it went stale.
 *
 * Generating it from the same constants the rest of the site imports means a
 * rename can never again leave the share card behind.
 *
 * Next prerenders this to a static PNG during `next build` — it costs nothing
 * per request, and crawlers that do not execute JavaScript still get a real
 * image at a real URL.
 */

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The logo mark, inlined as a data URI.
 *
 * Satori cannot fetch a relative path, and an absolute one would depend on the
 * site already being deployed — a chicken-and-egg at build time. Reading off
 * disk sidesteps both. Wrapped because a missing file must degrade to a
 * typographic card rather than fail the production build over an image.
 */
function logoDataUri(): string | null {
  try {
    const bytes = readFileSync(join(process.cwd(), "public", "logo-512.png"));
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const logo = logoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: BRAND.ink,
          backgroundImage: `radial-gradient(circle at 50% 38%, ${BRAND.crimson} 0%, #2c0101 42%, ${BRAND.ink} 78%)`,
          fontFamily: "sans-serif",
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width={132} height={132} style={{ objectFit: "contain" }} />
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 700,
            letterSpacing: -1.5,
            color: "#ffffff",
            marginTop: logo ? 34 : 0,
          }}
        >
          Altivance
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 13,
            textTransform: "uppercase",
            color: BRAND.gold,
            marginTop: 10,
          }}
        >
          Academic Consultancy
        </div>

        {/* Gold rule — the one piece of pure decoration, and it earns its place
            by separating the wordmark from the promise beneath it. */}
        <div
          style={{
            display: "flex",
            width: 148,
            height: 3,
            marginTop: 34,
            backgroundColor: BRAND.gold,
            borderRadius: 2,
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "rgba(255,255,255,0.82)",
            marginTop: 32,
          }}
        >
          {SITE_TAGLINE}
        </div>

        {/* Footer band: concrete proof rather than another slogan. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 46,
            fontSize: 23,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Project Writing · Research · Data Analysis · Study Abroad
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 9,
            backgroundColor: BRAND.crimsonBright,
          }}
        />
      </div>
    ),
    size,
  );
}
