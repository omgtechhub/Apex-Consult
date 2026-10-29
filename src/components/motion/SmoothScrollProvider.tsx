"use client";

/**
 * SmoothScrollProvider
 * --------------------
 * Wraps the app in a Lenis-driven scroll loop and publishes scroll state as
 * MotionValues so consumers can react without triggering React renders.
 *
 * Deliberate choices:
 *  - Smooth interpolation is applied to *wheel* input only. Touch devices keep
 *    their native momentum: OS-level scrolling is frame-perfect and
 *    interruptible in ways a JS rAF loop can't match, and hijacking it is the
 *    single most common way "premium" sites feel broken on a phone.
 *  - The rAF loop is owned here (`autoRaf: false`) so it can be torn down
 *    cleanly and so velocity is published on the same frame as the scroll.
 *  - When the user prefers reduced motion, Lenis is never constructed at all.
 *    Native scrolling is returned untouched.
 */

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import Lenis from "lenis";
import { motionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { usePathname } from "next/navigation";

type ScrollToOptions = {
  offset?: number;
  immediate?: boolean;
  duration?: number;
};

/**
 * The Lenis instance itself is deliberately NOT exposed. Everything consumers
 * need is reachable through these stable handles, which means the context value
 * never changes identity and mounting Lenis costs zero re-renders anywhere in
 * the tree.
 */
type SmoothScrollContextValue = {
  /** Signed px/frame. Negative = scrolling up. */
  velocity: MotionValue<number>;
  /** 0 → 1 across the full document height. */
  progress: MotionValue<number>;
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void;
  stop: () => void;
  start: () => void;
  /**
   * Run a callback on every scroll event, inside the existing rAF loop.
   * Returns an unsubscribe function.
   *
   * This exists so GSAP can be kept out of this file — see the note on the
   * provider below. Callbacks run synchronously on the scroll frame, which is
   * what `ScrollTrigger.update()` requires to stay in sync with Lenis.
   */
  onScroll: (cb: () => void) => () => void;
  /**
   * Run a callback whenever document geometry may have changed: fonts swapped,
   * window `load`, or a route change. Returns an unsubscribe function.
   */
  onRefresh: (cb: () => void) => () => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

/**
 * GSAP deliberately does NOT appear in this file.
 * ----------------------------------------------------------------------------
 * This provider lives in the root layout, so anything it imports is downloaded
 * and parsed on every route. It used to import `gsap` + `ScrollTrigger` purely
 * to call `ScrollTrigger.update()` on each scroll event — which put ~112KB of
 * GSAP on every page, while the only component that actually builds a
 * ScrollTrigger (`BatchReveal`) is used on a single route. On a phone that is
 * download, parse and compile cost paid by every visitor for a feature almost
 * none of them reach.
 *
 * Instead the provider publishes `onScroll` / `onRefresh`, and
 * `useScrollTriggerSync` — which owns the GSAP import and the plugin
 * registration — subscribes to them. GSAP now ships only in the chunks of
 * routes that genuinely use it.
 */

export function useSmoothScroll(): SmoothScrollContextValue {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    throw new Error("useSmoothScroll must be used inside <SmoothScrollProvider>");
  }
  return ctx;
}

/**
 * For components that enhance themselves with scroll velocity but must still
 * work standalone (Storybook, isolated tests, a page that opts out of Lenis).
 */
export function useSmoothScrollOptional(): SmoothScrollContextValue | null {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // Created once and never replaced, so subscribers keep a stable reference.
  const velocity = useMemo(() => motionValue(0), []);
  const progress = useMemo(() => motionValue(0), []);

  /**
   * Subscriber sets live in refs so adding a listener never re-renders the tree
   * and never changes the context value's identity.
   *
   * The effects below iterate these sets directly. The refs are stable for the
   * provider's lifetime, so there is nothing to keep in sync and no need to
   * mirror a "latest callback" into another ref — which would mean writing to a
   * ref during render, something concurrent rendering does not allow.
   */
  const scrollSubs = useRef(new Set<() => void>());
  const refreshSubs = useRef(new Set<() => void>());

  useEffect(() => {
    if (prefersReduced) return;

    const instance = new Lenis({
      // `lerp` reads more naturally than a fixed duration for wheel input:
      // it's frame-rate independent and preserves the feel of a flick.
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      // Native momentum on touch. See file header.
      syncTouch: false,
      touchMultiplier: 1.6,
      autoRaf: false,
      overscroll: false,
    });

    lenisRef.current = instance;

    const handleScroll = (e: Lenis) => {
      velocity.set(e.velocity);
      progress.set(e.progress);
      // Non-negotiable for GSAP: Lenis interpolates scroll on its own rAF loop,
      // so ScrollTrigger's cached scroll position goes stale the moment smooth
      // scrolling is enabled. Without a sync every pin and scrub drifts out of
      // sync with the actual viewport. `useScrollTriggerSync` subscribes here
      // and calls `ScrollTrigger.update()` itself, which keeps GSAP out of this
      // always-loaded module. With no GSAP on the page this is an empty loop.
      for (const cb of scrollSubs.current) cb();
    };
    instance.on("scroll", handleScroll);

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Pins are measured from the document, so they must be recalculated once
    // fonts have swapped and images have settled — otherwise every trigger is
    // anchored to a pre-layout position.
    const refresh = () => {
      for (const cb of refreshSubs.current) cb();
    };
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      instance.off("scroll", handleScroll);
      instance.destroy();
      lenisRef.current = null;
      velocity.set(0);
    };
  }, [prefersReduced, velocity, progress]);

  // Lenis caches its own scroll position, which desyncs whenever the App Router
  // navigates. Resync to whatever the browser settled on rather than forcing 0:
  // Next restores scroll on back/forward, and hard-zeroing here would throw that
  // away — the user would lose their place every time they hit Back.
  //
  // Deferred two frames: one for Next to commit the new tree, one for its scroll
  // restoration to land. `resize()` re-measures the new page's height first, or
  // Lenis would clamp against the *previous* document.
  useEffect(() => {
    const instance = lenisRef.current;
    if (!instance) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        instance.resize();
        instance.scrollTo(window.scrollY, { immediate: true, force: true });
        velocity.set(0);
        // The new route has a different document height and different trigger
        // positions; without this, pins from the previous page's measurements
        // fire at the wrong scroll offsets.
        for (const cb of refreshSubs.current) cb();
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname, velocity]);

  const value = useMemo<SmoothScrollContextValue>(
    () => ({
      velocity,
      progress,
      scrollTo: (target, options = {}) => {
        const instance = lenisRef.current;
        if (instance) {
          instance.scrollTo(target, {
            offset: options.offset ?? 0,
            immediate: options.immediate,
            duration: options.duration ?? 1.1,
          });
          return;
        }
        // Reduced-motion / pre-hydration fallback.
        const el =
          typeof target === "string" ? document.querySelector(target) : target;
        if (el instanceof HTMLElement) {
          const top = el.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0);
          window.scrollTo({ top, behavior: "auto" });
        } else if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: "auto" });
        }
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
      onScroll: (cb: () => void) => {
        scrollSubs.current.add(cb);
        return () => {
          scrollSubs.current.delete(cb);
        };
      },
      onRefresh: (cb: () => void) => {
        refreshSubs.current.add(cb);
        return () => {
          refreshSubs.current.delete(cb);
        };
      },
    }),
    [velocity, progress]
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
