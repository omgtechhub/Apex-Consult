"use client";

/**
 * Route transition
 * ----------------
 * `template.tsx` (unlike `layout.tsx`) remounts on every navigation, which
 * makes it the correct place for enter choreography.
 *
 * CRITICAL: this must not animate on the *first* paint.
 *
 * Framer Motion serialises `initial` into the server-rendered HTML, so an
 * `initial={{ opacity: 0 }}` here ships `<main><div style="opacity:0">` wrapping
 * the entire page. Every visitor then depends on JavaScript executing and
 * hydrating successfully just to see any content at all — and if it is slow,
 * blocked, or throws, the site renders permanently blank. Crawlers that don't
 * run JS see the same nothing.
 *
 * A page transition is meant to cover the gap *between* two pages. On the very
 * first load there is no previous page to transition from, and the hero already
 * owns that entrance. So: first paint renders plain, and the transition applies
 * only to client-side navigations.
 *
 * `will-change` is torn down once the entrance settles: a permanent hint here
 * pins a document-sized compositor layer for the life of the page.
 *
 * It no longer hints `filter`, because `pageVariants` no longer animates one.
 * A filter on this wrapper was both the most expensive thing on the page to
 * animate (a Gaussian over a document-sized texture, every frame, while the
 * new route is still hydrating) and the thing that made navigation *read* as
 * slow — an out-of-focus page is the universal idiom for "not ready yet". It
 * also made the element the containing block for any `position: fixed`
 * descendant, a hazard that is now gone by construction rather than by
 * teardown. See the note on `pageVariants` in src/lib/motion.ts.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageVariants, pageVariantsReduced } from "@/lib/motion";

/**
 * Module scope, so it survives the template remounting on navigation but resets
 * on a full document load. False during the first render pass = SSR/first paint.
 */
let hasNavigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion() ?? false;
  // Read once at mount so the value can't flip mid-render.
  const [shouldAnimate] = useState(() => hasNavigated);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  // First paint, reduced motion, or already finished: render an inert wrapper
  // with no inline styles at all, so content is visible without JavaScript.
  if (!shouldAnimate || settled) return <div>{children}</div>;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={prefersReduced ? pageVariantsReduced : pageVariants}
      onAnimationComplete={() => setSettled(true)}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
