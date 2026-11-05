/**
 * Route skeletons
 * ============================================================================
 * Suspense fallbacks for the two page silhouettes this site actually has.
 *
 * WHY THE SHAPE MATTERS MORE THAN THE DETAIL
 * ----------------------------------------------------------------------------
 * A `loading.tsx` is shown *in place of* the route being navigated to, so the
 * only thing it has to get right is the page's ground colour at the top of the
 * viewport. Get that wrong and every click drives a full luminance inversion
 * before the real page arrives — dark, white, dark — which reads as the page
 * reloading from scratch however fast the RSC payload actually was.
 *
 * That failure is theme-asymmetric, which is what made it so confusing to
 * diagnose. In dark mode the page canvas (#0f1419) is within three points of
 * `surface-dark` (#141b23), so a mismatched fallback is invisible and
 * navigation feels smooth. In light mode the canvas is #ffffff and the same
 * mismatch is the maximum possible contrast step. Same code, same timings,
 * completely different experience — and the fix is not to tint anything, it is
 * to stop changing the ground colour mid-navigation.
 *
 * So there are two skeletons, because there are two silhouettes:
 *
 *   HeroRouteSkeleton      opens with a full-bleed `bg-surface-dark` hero.
 *                          Matches /, /about, /pricing, /services,
 *                          /services/[slug], /study-abroad, /blog, /book,
 *                          /contact, /faq, /pay, /resources, /testimonials —
 *                          i.e. `PageHero` and its four hand-rolled twins.
 *
 *   DocumentRouteSkeleton  opens on the page canvas under the fixed header.
 *                          Matches /scholarships, /scholarships/[slug],
 *                          /blog/[slug], the four `LegalShell` policy pages,
 *                          and the admin area.
 *
 * Each route family points its own `loading.tsx` at the right one. The root
 * `app/loading.tsx` takes the hero variant because that is the larger family
 * and every primary nav destination is in it.
 *
 * `animate-pulse` is a compositor-only opacity loop, so it costs nothing on
 * the mobile GPU budget the rest of the site is tuned for. Both skeletons are
 * `aria-hidden` under a single polite status line, so a screen reader hears
 * "Loading…" once rather than reading out a tree of empty boxes.
 */

/** Placeholder blocks inside the dark band.
 *
 *  White-alpha, never `bg-ink-*`: the ink ramp inverts between themes, so an
 *  ink step that reads as a subtle block on dark in one theme reads as a solid
 *  slab in the other. White-alpha over a fixed dark ground is theme-stable by
 *  construction — the same reason the hero's own type is white rather than
 *  `ink-950`. */
function Bar({ className }: { className?: string }) {
  return <div className={`rounded-full bg-white/10 ${className ?? ""}`} />;
}

export function HeroRouteSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>

      <div aria-hidden="true" className="animate-pulse">
        {/* Hero band — same metrics as PageHero, so the swap is a no-op. */}
        <div className="bg-surface-dark pt-28 lg:pt-40 pb-16 lg:pb-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Bar className="h-3 w-40 bg-white/12 mb-10" />

            <div className="max-w-3xl space-y-5">
              {/* Eyebrow: rule + label, as every hero has */}
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-white/25" />
                <Bar className="h-3 w-28 bg-white/15" />
              </div>

              {/* Headline, two lines */}
              <div className="h-12 lg:h-16 w-full rounded-2xl bg-white/15" />
              <div className="h-12 lg:h-16 w-3/5 rounded-2xl bg-white/10" />

              {/* Standfirst */}
              <div className="space-y-3 pt-2 max-w-2xl">
                <Bar className="h-4 w-full bg-white/8" />
                <Bar className="h-4 w-4/5 bg-white/8" />
              </div>

              {/* Action row */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="h-12 w-44 rounded-xl bg-white/15" />
                <div className="h-12 w-36 rounded-xl bg-white/8" />
              </div>
            </div>
          </div>
        </div>

        {/* Body — the card grid most of these pages open with. */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl border border-ink-200/60 bg-surface"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Light-canvas routes.
 *
 * `pt-24 lg:pt-32` is not a guess — it is the exact top padding `LegalShell`,
 * `blog/[slug]` and the scholarship pages all use to clear the fixed 80px
 * header, so the fallback starts its content on the same line the real page
 * will. Placeholders here use `bg-ink-200`, which inverts with the theme and is
 * therefore the correct family on a canvas that also inverts — the mirror image
 * of the white-alpha rule inside the dark band above.
 */
export function DocumentRouteSkeleton({
  label = "Loading…",
  /** Render the wide content card rather than a prose column. */
  wide = false,
}: {
  label?: string;
  wide?: boolean;
}) {
  return (
    <div role="status" aria-live="polite" className="bg-canvas min-h-screen pt-24 lg:pt-32">
      <span className="sr-only">{label}</span>

      <div
        aria-hidden="true"
        className={`animate-pulse mx-auto px-4 sm:px-6 lg:px-8 py-16 ${
          wide ? "max-w-[1400px]" : "max-w-3xl"
        }`}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-3 w-12 rounded-full bg-ink-200/70" />
          <div className="h-3 w-2 rounded-full bg-ink-200/50" />
          <div className="h-3 w-24 rounded-full bg-ink-200/70" />
        </div>

        {/* The card these pages put their content in */}
        <div className="rounded-3xl border border-ink-200/60 bg-surface p-8 lg:p-12 shadow-layered">
          <div className="h-8 w-2/3 rounded-2xl bg-ink-200/70 mb-3" />
          <div className="h-3 w-40 rounded-full bg-ink-200/50 mb-10" />

          <div className="space-y-8">
            {[0, 1, 2].map((section) => (
              <div key={section} className="space-y-3">
                <div className="h-4 w-48 rounded-lg bg-ink-200/70" />
                <div className="h-3 w-full rounded-full bg-ink-200/45" />
                <div className="h-3 w-11/12 rounded-full bg-ink-200/45" />
                <div className="h-3 w-4/5 rounded-full bg-ink-200/45" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
