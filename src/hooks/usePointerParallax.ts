"use client";

import { useEffect, useMemo, type RefObject } from "react";
import {
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { spring } from "@/lib/motion";
import { useFinePointer } from "./useFinePointer";

type PointerParallax = {
  /** −0.5 (left edge) → 0.5 (right edge), spring-smoothed. */
  x: MotionValue<number>;
  /** −0.5 (top edge) → 0.5 (bottom edge), spring-smoothed. */
  y: MotionValue<number>;
};

/**
 * Tracks the pointer across a container and exposes it as normalised, damped
 * MotionValues for parallax layers.
 *
 * Replaces the common `useState` + `mousemove` pattern, which re-renders the
 * entire subtree at pointer sample rate (~120Hz on a trackpad) and is the
 * fastest way to make an otherwise-static hero drop frames.
 *
 * The listener is registered on the container, not `window`, so it stops firing
 * the moment the hero scrolls out from under the cursor.
 */
export function usePointerParallax(
  ref: RefObject<HTMLElement | null>
): PointerParallax {
  const prefersReduced = useReducedMotion() ?? false;
  const finePointer = useFinePointer();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const config = useMemo(() => spring.gentle, []);
  const x = useSpring(rawX, config);
  const y = useSpring(rawY, config);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced || !finePointer) return;

    // Cached on enter and on resize — never read inside the move handler.
    let rect = el.getBoundingClientRect();

    const measure = () => {
      rect = el.getBoundingClientRect();
    };

    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX - rect.left) / rect.width - 0.5);
      rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    el.addEventListener("pointerenter", measure);
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      el.removeEventListener("pointerenter", measure);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
    };
  }, [ref, rawX, rawY, prefersReduced, finePointer]);

  return { x, y };
}
