"use client";

/**
 * BatchReveal
 * -----------
 * GSAP `ScrollTrigger.batch()` entrance for card grids.
 *
 * Why GSAP rather than the Framer `<Stagger>` used elsewhere:
 *
 * `<Stagger>` orchestrates children from a *single* viewport trigger on the
 * parent — perfect when a group enters as one unit. It's the wrong tool for a
 * long page of grids, because the parent either fires while most of its cards
 * are still far off-screen, or waits until the whole grid is visible.
 *
 * `ScrollTrigger.batch()` gives each card its own trigger but *collects* the
 * ones that cross the line within the same interval and animates them as one
 * staggered group. Cards that enter together animate together; cards further
 * down wait their turn. That's the behaviour a multi-row grid actually wants,
 * and it's what this plugin exists for.
 *
 * Reduced motion is handled by `gsap.matchMedia()`, which reverts automatically
 * if the user changes the setting mid-session.
 */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

type BatchRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Selector for the items to reveal, scoped to this container. */
  selector?: string;
  /** Seconds between items within one batch. */
  each?: number;
  /** Travel distance in px. */
  distance?: number;
  as?: "div" | "section" | "ul";
};

export function BatchReveal({
  children,
  className,
  selector = "[data-batch-item]",
  each = 0.08,
  distance = 32,
  as = "div",
}: BatchRevealProps) {
  const root = useRef<HTMLDivElement>(null);
  // A union of intrinsic tags gives `ref` an intersection type no single
  // element ref can satisfy. Widening to ElementType keeps the public `as` API
  // while letting the ref resolve to the container we actually render.
  const Tag = as as React.ElementType;

  useGSAP(
    () => {
      // `useGSAP`'s `scope` only scopes selector strings handed straight to
      // gsap methods — `gsap.utils.toArray` ignores it and would query the whole
      // document, so every instance would fight over every other grid's cards.
      // The scope has to be passed explicitly.
      const items = gsap.utils.toArray<HTMLElement>(selector, root.current);
      if (!items.length) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { motion } = context.conditions as { motion: boolean };

          if (!motion) {
            // Reduced motion still gets a state change, just no travel.
            gsap.set(items, { opacity: 1, y: 0 });
            return;
          }

          gsap.set(items, { opacity: 0, y: distance });

          const triggers = ScrollTrigger.batch(items, {
            // `start` sits above the fold line so a card has finished animating
            // by the time it's comfortably readable.
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: each,
                ease: "power3.out",
                overwrite: true,
              }),
          });

          return () => {
            triggers.forEach((t) => t.kill());
            gsap.set(items, { clearProps: "opacity,transform" });
          };
        }
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [selector, each, distance] }
  );

  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  );
}
