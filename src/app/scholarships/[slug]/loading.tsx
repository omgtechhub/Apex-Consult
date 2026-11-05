/**
 * Skeleton for a single scholarship.
 *
 * This route is the slowest on the site: it awaits the Pipeline API twice —
 * once in `generateMetadata`, once in the page — and the client is given an
 * 8-second timeout before it falls back to the bundled dataset. Without a
 * boundary, that whole wait happened on the *previous* page with nothing on
 * screen to show a navigation had started.
 *
 * THE HEADER BAND IS LIGHT, NOT DARK.
 * ----------------------------------------------------------------------------
 * It used to be `bg-surface-dark`, borrowed from the hero skeletons, but this
 * page has no photographic hero: it is `bg-canvas … pt-24` with a
 * `py-12 bg-surface` header strip (see page.tsx). So the fallback was opening
 * a near-black band and then handing over to a white page, which on the
 * slowest route on the site put the longest, most visible luminance inversion
 * in the worst possible place. In dark mode it went unnoticed, because the
 * canvas and `surface-dark` are three points apart there — which is exactly
 * why this class of mistake only ever gets reported as "light mode is slow".
 *
 * The shape otherwise mirrors the real page (8/4 split, same radii and
 * spacing) so the swap reads as the content arriving rather than the layout
 * changing.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-canvas text-ink-950 min-h-screen pt-24 pb-32"
    >
      <span className="sr-only">Loading scholarship…</span>

      <div aria-hidden="true" className="animate-pulse">
        {/* Breadcrumb, above the header strip as on the page itself */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 rounded-full bg-ink-200/70" />
            <div className="h-3 w-2 rounded-full bg-ink-200/50" />
            <div className="h-3 w-24 rounded-full bg-ink-200/70" />
            <div className="h-3 w-2 rounded-full bg-ink-200/50" />
            <div className="h-3 w-40 rounded-full bg-ink-200/70" />
          </div>
        </div>

        {/* Header strip — `py-12 bg-surface`, matching the page */}
        <div className="py-12 bg-surface border-b border-ink-200/60 mb-12 mt-4">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 mb-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-7 w-28 rounded-full bg-ink-200/70" />
              ))}
            </div>

            <div className="h-10 w-4/5 max-w-3xl rounded-2xl bg-ink-200/70 mb-3" />
            <div className="h-10 w-2/5 max-w-xl rounded-2xl bg-ink-200/50 mb-6" />

            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 w-40 rounded-full bg-ink-200/50" />
              ))}
            </div>
          </div>
        </div>

        {/* Body: same 8/4 split as the page itself */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-ink-200/60 bg-surface p-8 space-y-3"
                >
                  <div className="h-5 w-40 rounded-lg bg-ink-200/70" />
                  <div className="h-3 w-full rounded-full bg-ink-200/50" />
                  <div className="h-3 w-11/12 rounded-full bg-ink-200/50" />
                  <div className="h-3 w-4/5 rounded-full bg-ink-200/50" />
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-ink-200/80 bg-surface p-6 space-y-3">
                <div className="h-5 w-28 rounded-lg bg-ink-200/70" />
                <div className="h-11 w-full rounded-xl bg-ink-200/60" />
                <div className="h-11 w-full rounded-xl bg-ink-200/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
