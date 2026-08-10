"use client";

/**
 * Magnetic
 * --------
 * Pulls its child toward the pointer, then springs back on exit.
 *
 * Performance notes:
 *  - Pointer position is written to MotionValues, never to React state. This
 *    component renders once and then never again for the life of the hover.
 *  - `getBoundingClientRect()` is read on pointer *enter* only and cached, so
 *    the move handler does no layout reads. (Reading it per-move is the usual
 *    cause of magnetic buttons tanking a scroll.)
 *  - Disabled entirely on coarse pointers — there is no hover on touch, and the
 *    transform would just fight the tap.
 */

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { spring } from "@/lib/motion";
import { useFinePointer } from "@/hooks/useFinePointer";

type MagneticProps = {
  children: React.ReactNode;
  /** 0 = inert, 1 = the element's centre reaches the pointer. */
  strength?: number;
  /** Independent, usually larger, pull applied to the inner content. */
  contentStrength?: number;
  className?: string;
};

export function Magnetic({
  children,
  strength = 0.32,
  contentStrength = 0.14,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const finePointer = useFinePointer();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  const sx = useSpring(x, spring.magnetic);
  const sy = useSpring(y, spring.magnetic);
  const scx = useSpring(cx, spring.magnetic);
  const scy = useSpring(cy, spring.magnetic);

  const handleEnter = useCallback(() => {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
  }, []);

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      const r = rect.current;
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      x.set(dx * strength);
      y.set(dy * strength);
      cx.set(dx * contentStrength);
      cy.set(dy * contentStrength);
    },
    [x, y, cx, cy, strength, contentStrength]
  );

  const handleLeave = useCallback(() => {
    rect.current = null;
    x.set(0);
    y.set(0);
    cx.set(0);
    cy.set(0);
  }, [x, y, cx, cy]);

  if (prefersReduced || !finePointer) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <motion.div style={{ x: scx, y: scy }}>{children}</motion.div>
    </motion.div>
  );
}
