"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * True when the primary input is a mouse/trackpad rather than touch.
 *
 * Reports `false` on the server and on the hydrating render — the device is
 * unknowable there — so pointer-driven effects render inert and then enable
 * after hydration, never the reverse. See the SSR contract in `useMediaQuery`.
 *
 * Used as the gate for two different things, and the distinction is worth
 * stating because it is the same query for two reasons:
 *
 *  1. Effects that are *meaningless* without a pointer — cursor parallax, card
 *     tilt, a specular sheen that tracks the cursor, Lenis's smooth *wheel*
 *     interpolation. A phone has no cursor and no wheel.
 *  2. Effects that are affordable on a desktop GPU and not on a phone's —
 *     full-viewport composited parallax on a photographic backdrop. A coarse
 *     pointer is the most reliable proxy for "mobile GPU, mobile thermal
 *     budget" that CSS exposes; there is no media query for "is fast".
 */
export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}
