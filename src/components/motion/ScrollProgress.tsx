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
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-gold-400 via-gold-500 to-gold-700"
      style={{
        scaleX: prefersReduced ? scrollYProgress : scaleX,
        willChange: "transform",
      }}
    />
  );
}
