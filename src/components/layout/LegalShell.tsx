import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

/**
 * LegalShell
 * ----------
 * Shared chrome for the four policy pages (privacy, terms, refund, cookies).
 *
 * All four had byte-identical wrappers — same breadcrumb, same card, same
 * heading block, same "Last updated" line, each with its own copy of the
 * hardcoded colours. Diverging by hand was inevitable. One shell means a change
 * to legal-page presentation happens in exactly one place.
 *
 * Motion here is deliberately minimal: one reveal on the card, nothing on the
 * body. These pages are read carefully by people who need a specific clause,
 * sometimes under stress — animating dense legal text on scroll would be
 * decoration actively working against the page's only job. The `prose-legal`
 * class carries the typography so every policy page reads identically.
 */
export function LegalShell({
  title,
  updated = "January 2025",
  children,
}: {
  title: string;
  /** Shown under the heading. Update when the policy itself changes. */
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-24 lg:pt-32 bg-canvas min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal choreography="fade" duration={0.4}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-500 mb-8">
            <Link href="/" className="hover:text-brand-500 transition-colors duration-200 ease-standard">
              Home
            </Link>
            <span>/</span>
            <span className="text-ink-950">{title}</span>
          </nav>
        </Reveal>

        <Reveal choreography="rise">
          <div className="bg-surface border border-ink-200/60 rounded-3xl p-8 lg:p-12 shadow-layered">
            <h1 className="text-3xl font-black font-display text-ink-950 mb-2">{title}</h1>
            <p className="text-sm text-ink-500 mb-8">Last updated: {updated}</p>

            <div className="prose-legal space-y-8 text-ink-700">{children}</div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/**
 * A titled clause. Keeps heading level, weight, and spacing consistent across
 * every policy — previously each page restyled its own `<h2>`.
 */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink-950 font-display mb-3">{heading}</h2>
      <div className="text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
