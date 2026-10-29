"use client";

/**
 * Parallax
 * --------
 * Scroll-linked translation, spring-damped so it never jitters against Lenis's
 * interpolated scroll position.
 *
 * `speed` is expressed as a fraction of the element's own height:
 *   0.2  → drifts down 20% of its height slower than the page (recedes)
 *  -0.2  → runs 20% ahead of the page (approaches)
 *
 * Anything past ~0.35 starts to visibly detach from the layout and reads as a
 * bug rather than depth.
 */

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { spring } from "@/lib/motion";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  /** Also scale slightly across the scroll range, for atmospheric layers. */
  scaleRange?: [number, number];
  /** Fade in/out across the scroll range. */
  opacityRange?: [number, number];
};

export function Parallax({
  children,
  className,
  speed = 0.2,
  scaleRange,
  opacityRange,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion() ?? false;

  // "start end" → "end start" spans the entire time the element is on screen,
  // so progress is 0 as it enters the bottom and 1 as it exits the top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const damped = useSpring(scrollYProgress, spring.scrub);

  const y = useTransform(damped, [0, 1], [`${speed * -50}%`, `${speed * 50}%`]);
  const scale = useTransform(damped, [0, 1], scaleRange ?? [1, 1]);
  const opacity = useTransform(damped, [0, 0.5, 1], [
    opacityRange?.[0] ?? 1,
    1,
    opacityRange?.[1] ?? 1,
  ]);

  /**
   * Same element type in both cases, for the reason documented in `Tilt`:
   * swapping between `<div>` and `<motion.div>` across renders makes React tear
   * down and rebuild the children.
   *
   * `useReducedMotion()` returns `null` during SSR and resolves on the client,
   * so for a visitor who *has* reduced motion enabled this value flips right
   * after hydration — remounting everything inside for exactly the users least
   * well served by things being rebuilt underneath them. Keeping one element and
   * dropping the styles avoids it.
   */
  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        prefersReduced
          ? undefined
          : {
              y,
              scale: scaleRange ? scale : undefined,
              opacity: opacityRange ? opacity : undefined,
              willChange: "transform",
            }
      }
    >
      {children}
    </motion.div>
  );
}
