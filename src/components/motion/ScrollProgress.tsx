"use client";

/**
 * ScrollProgress
 * --------------
 * A hairline reading-progress bar pinned to the top of the viewport.
 *
 * Driven by `scaleX` on a spring rather than by animating `width`, so it never
 * touches layout. Purely decorative, so it is hidden from assistive tech — the
 * information it conveys is already available to a screen reader through the
 * document structure itself.
 */

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { spring } from "@/lib/motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReduced = useReducedMotion() ?? false;
  const scaleX = useSpring(scrollYProgress, spring.scrub);

  return (
    <motion.div
      aria-hidden="true"
      // Red into yellow: the brand's two accents in the one element that is on
      // screen for the whole of every page.
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand-600 via-brand-500 to-accent-400"
      style={{
        scaleX: prefersReduced ? scrollYProgress : scaleX,
        willChange: "transform",
      }}
    />
  );
}
