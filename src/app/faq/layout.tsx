import type { Metadata } from "next";

/**
 * Metadata carrier for /faq.
 *
 * WHY THIS FILE EXISTS: `faq/page.tsx` is a `"use client"` component — it owns
 * the accordion state and the search box — and a client component cannot
 * export `metadata`. Next only reads `metadata` from server modules, so the
 * page was silently inheriting the root layout's defaults: its <title> read
 * "Altivance Academic Consultancy | Where Academic Excellence Meets Results",
 * identical to the homepage, and its description was the homepage's. Two pages
 * sharing a title and description is the sort of thing that gets one of them
 * treated as the lesser duplicate of the other.
 *
 * A layout is the fix rather than converting the page to a server component:
 * layouts are server modules by default, so this file can export `metadata`
 * while the interactive page below it stays a client component untouched.
 *
 * It deliberately does nothing else. Rendering `children` straight through
 * adds no DOM, no wrapper div and no styling, so the page's own layout and the
 * root layout's shell are unaffected.
 *
 * `title` is the short form on purpose — the root layout's title template
 * (`"%s | Altivance Academic Consultancy"`) appends the brand, so writing the
 * brand here too would produce it twice.
 *
 * The canonical URL is NOT set here. The root layout's `alternates.canonical`
 * is `"./"`, which Next resolves against the current pathname, so /faq already
 * gets `https://altivance.com.ng/faq`. Restating it would be a second place to
 * keep in sync.
 */
export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to 18 common questions about Altivance Academic Consultancy — turnaround times, revisions, pricing, payment, confidentiality, originality, and study abroad support.",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
