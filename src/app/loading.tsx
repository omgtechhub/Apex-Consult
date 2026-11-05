/**
 * Catch-all route loading fallback.
 * ----------------------------------------------------------------------------
 * The App Router will not swap pages until the new route's server component has
 * resolved. Without a `loading.tsx` anywhere in the tree there is no Suspense
 * boundary to show meanwhile, so a click produced a dead pause on the old page
 * — measured at ~1.4s on an already-compiled route, and longer on a cold one or
 * when `/scholarships/[slug]` is waiting on the Pipeline API (8s timeout).
 *
 * Nothing was broken; there was simply no feedback, which reads as the link not
 * working and invites a second click.
 *
 * WHY THE HERO VARIANT
 * ----------------------------------------------------------------------------
 * This fallback stands in for whichever route has no nearer `loading.tsx`, and
 * that is the dark-hero family: /, /about, /pricing, /services,
 * /services/[slug], /study-abroad, /blog, /book, /contact, /faq, /pay,
 * /resources, /testimonials. All thirteen open with a full-bleed
 * `bg-surface-dark` photographic band, so the fallback has to as well.
 *
 * The earlier version of this file opened on the white page canvas instead, and
 * that single mismatch is what made navigation feel slow in light mode and
 * smooth in dark: every click drove dark hero -> white page -> dark hero, two
 * full luminance inversions, while in dark mode the canvas and the hero are
 * three points apart and the same swap is invisible.
 *
 * The light-canvas routes (/scholarships, /blog/[slug], the policy pages, the
 * admin area) each point their own `loading.tsx` at `DocumentRouteSkeleton`
 * for the same reason, in the other direction. See src/components/layout/
 * RouteSkeleton.tsx.
 */
import { HeroRouteSkeleton } from "@/components/layout/RouteSkeleton";

export default function Loading() {
  return <HeroRouteSkeleton />;
}
