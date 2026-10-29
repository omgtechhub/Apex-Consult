"use client";

/**
 * PinnedScroll
 * ------------
 * GSAP ScrollTrigger primitives for the one category of motion Framer Motion
 * genuinely cannot express: **pinning**.
 *
 * Framer's `useScroll` can map scroll position onto values, but it cannot hold
 * a section fixed in the viewport while the page continues to scroll "through"
 * it. That requires taking the element out of flow, inserting a spacer of
 * exactly the right height, and restoring both on refresh — which is what
 * ScrollTrigger's `pin` does.
 *
 * Everything else on this site stays on Framer. Reaching for GSAP here is about
 * capability, not preference.
 *
 * Reduced motion is handled with `gsap.matchMedia()`, which registers the
 * animation only while the media query matches and reverts it automatically
 * when it stops — so a user toggling the OS setting mid-session gets a clean
 * teardown rather than a half-pinned section.
 */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScrollTriggerSync } from "./useScrollTriggerSync";
import { cn } from "@/lib/utils";

type PinnedRevealProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * How far the user scrolls, in viewport heights, while the section is held.
   * Keep this low — pinning steals the scrollbar from the user, and anything
   * past ~1.5 screens starts to feel like the page has frozen.
   */
  distance?: number;
};

/**
 * Pins a section and scrubs its children's entrance across the held scroll
 * range. Children marked `data-pin-item` animate in sequence.
 */
export function PinnedReveal({
  children,
  className,
  distance = 1,
}: PinnedRevealProps) {
  const root = useRef<HTMLDivElement>(null);

  // Keeps ScrollTrigger in step with Lenis; see useScrollTriggerSync.
  useScrollTriggerSync();

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-pin-item]");
      if (!items.length) return;

      const mm = gsap.matchMedia();

      // Pin only where there's room for it. On a short or narrow viewport a
      // pinned section eats the whole screen and the content below becomes
      // unreachable-feeling, so small screens get a plain staggered reveal.
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
          plain: "(prefers-reduced-motion: reduce), (max-width: 1023px)",
        },
        (context) => {
          const { animate } = context.conditions as { animate: boolean };

          if (!animate) {
            gsap.set(items, { opacity: 1, y: 0, scale: 1 });
            return;
          }

          gsap.set(items, { opacity: 0, y: 48, scale: 0.97 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: `+=${distance * 100}%`,
              pin: true,
              // Numeric scrub adds a short catch-up so the sequence glides
              // rather than snapping frame-for-frame with the wheel.
              scrub: 0.6,
              anticipatePin: 1,
            },
          });

          tl.to(items, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.15,
            ease: "power2.out",
          });

          return () => {
            gsap.set(items, { clearProps: "all" });
          };
        }
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [distance] }
  );

  return (
    <div ref={root} className={cn("relative", className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type HorizontalScrollProps = {
  children: React.ReactNode;
  className?: string;
  trackClassName?: string;
};

/**
 * Pinned horizontal scroll: the section holds still while vertical wheel input
 * drives the track sideways.
 *
 * The track tween uses `ease: "none"` — required, not stylistic. Any other ease
 * breaks the 1:1 mapping between scroll distance and horizontal position, and
 * the content appears to slip against the user's input.
 */
export function HorizontalScroll({
  children,
  className,
  trackClassName,
}: HorizontalScrollProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Keeps ScrollTrigger in step with Lenis; see useScrollTriggerSync.
  useScrollTriggerSync();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Below lg the track becomes a normal swipeable overflow strip: touch
      // users already have a horizontal gesture, and hijacking their vertical
      // scroll to drive it is actively worse than the native affordance.
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
        () => {
          const el = track.current;
          if (!el) return;

          const scrollDistance = () => el.scrollWidth - window.innerWidth;
          if (scrollDistance() <= 0) return;

          const tween = gsap.to(el, {
            x: () => -scrollDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              // Match the pinned scroll length to the actual overflow so the
              // track finishes exactly as the pin releases.
              end: () => `+=${scrollDistance()}`,
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          return () => tween.kill();
        }
      );

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className={cn("relative overflow-hidden", className)}>
      <div
        ref={track}
        className={cn(
          "flex gap-6",
          // The lg: reset hands control back to native scrolling on small
          // screens, where the GSAP branch above never runs.
          "overflow-x-auto lg:overflow-x-visible",
          trackClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { ScrollTrigger };
