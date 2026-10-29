"use client";

/**
 * useScrollTriggerSync
 * --------------------
 * The bridge between Lenis and GSAP ScrollTrigger — and the only place in the
 * app that is allowed to pull GSAP into a shared module.
 *
 * Why it exists:
 *
 * Lenis interpolates scroll position on its own rAF loop, so ScrollTrigger's
 * cached scroll position goes stale the moment smooth scrolling is enabled.
 * Every pin and scrub then drifts out of sync with the viewport. The fix is to
 * call `ScrollTrigger.update()` on each Lenis scroll event, and to re-measure
 * after fonts swap, after `load`, and after a route change.
 *
 * That sync used to live inside `SmoothScrollProvider`, which sits in the root
 * layout — so `gsap` + `ScrollTrigger` (~112KB) were downloaded, parsed and
 * compiled on every single route, even though the only component that builds a
 * ScrollTrigger is used on one page. Phones paid that cost on every visit.
 *
 * Now the provider just publishes `onScroll` / `onRefresh`, and this hook —
 * imported only by the GSAP-backed components — subscribes to them. GSAP ends
 * up in the route chunks that actually use it and nowhere else.
 *
 * Call this once from any component that creates ScrollTriggers.
 */

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScrollOptional } from "./SmoothScrollProvider";

/**
 * Registered at module scope so it happens exactly once, before any component
 * can build a ScrollTrigger. Guarded for SSR — ScrollTrigger touches `window`
 * on registration.
 *
 * `lagSmoothing(0)` matters here: GSAP's default lag smoothing fast-forwards
 * the ticker after a long frame, which fights Lenis's own interpolation and
 * shows up as a jolt when the main thread is briefly busy.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
}

export function useScrollTriggerSync(): void {
  const smooth = useSmoothScrollOptional();

  useEffect(() => {
    // No provider (reduced motion, or a component rendered standalone) means
    // native scrolling, which ScrollTrigger already tracks by itself.
    if (!smooth) return;

    const offScroll = smooth.onScroll(() => ScrollTrigger.update());
    const offRefresh = smooth.onRefresh(() => ScrollTrigger.refresh());

    // Deliberately no eager `ScrollTrigger.refresh()` here.
    //
    // ScrollTrigger already measures each trigger as it is created, and the
    // provider emits a refresh on fonts-ready, window `load` and route change —
    // the points at which geometry has actually settled. Refreshing on mount
    // instead measures against a document that has not finished laying out:
    // images have no height yet, so the page is short, items that belong far
    // below the fold fall inside `start: "top 88%"`, and a `once: true` batch
    // fires for all of them immediately. They then sit permanently revealed and
    // the entrance animation never plays. (Observed: all 11 below-fold cards on
    // /services were already at opacity 1 at load.)

    return () => {
      offScroll();
      offRefresh();
    };
  }, [smooth]);
}
