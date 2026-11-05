/**
 * Skeleton for a single service.
 *
 * These are the links in the nav's Services dropdown. The data is static, so
 * the server renders quickly once warm — but the App Router still holds the old
 * page until the RSC payload arrives, and in development there is no prefetch
 * at all, so every first visit to a service paid a compile plus a round trip
 * with nothing on screen.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading service…</span>

      <div aria-hidden="true" className="animate-pulse">
        {/* `pt-28 lg:pt-40 pb-8 lg:pb-10` is not a rounded guess — it is
            exactly what this route passes PageHero (`className="pb-8 lg:pb-10"`
            over the shared `pt-28 lg:pt-40`). The band being dark is what keeps
            the swap invisible; the padding matching is what keeps the content
            from jumping a line when it arrives. */}
        <div className="bg-surface-dark pt-28 lg:pt-40 pb-8 lg:pb-10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-3 w-44 rounded-full bg-white/15" />
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-44 rounded-3xl border border-ink-200/60 bg-surface"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
