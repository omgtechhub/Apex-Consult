"use client";

/**
 * Counter
 * -------
 * Counts to a target when scrolled into view.
 *
 * Written straight to `textContent` from an rAF-driven MotionValue rather than
 * through React state. A `setInterval` counter — the usual implementation —
 * re-renders 60 times per number, drifts against the real clock under load, and
 * ticks linearly so it has no sense of arrival. This eases out and settles.
 *
 * SSR contract: the *final* value is what renders on the server, so crawlers and
 * no-JS visitors read the real number. On the client the value is zeroed in a
 * layout effect — before the browser paints — so there is no flash of the
 * answer followed by a jump back to zero.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { duration as durationTokens, ease } from "@/lib/motion";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type CounterProps = {
  value: number;
  /** Appended verbatim — "%", "+", "k". */
  suffix?: string;
  prefix?: string;
  /** Seconds. Larger numbers deserve longer runs. */
  duration?: number;
  decimals?: number;
  className?: string;
};

export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = durationTokens.slowest * 1.6,
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReduced = useReducedMotion() ?? false;

  const format = (n: number) =>
    `${prefix}${n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  // Pre-paint: swap the SSR'd final value for the start value.
  useIsomorphicLayoutEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (el) el.textContent = format(0);
  }, [prefersReduced]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;

    if (prefersReduced) {
      el.textContent = format(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: ease.entrance,
      onUpdate: (latest) => {
        el.textContent = format(latest);
      },
      onComplete: () => {
        // Guarantee an exact landing — easing can stop a hair short.
        el.textContent = format(value);
      },
    });

    return () => controls.stop();
    // `format` is derived entirely from primitives already in this list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, duration, prefersReduced, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
