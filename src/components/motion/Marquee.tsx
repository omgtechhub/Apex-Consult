"use client";

/**
 * Marquee
 * -------
 * A continuously scrolling strip that responds to scroll velocity: flick the
 * page down and the strip accelerates and skews with you; scroll up and it
 * reverses. Idle, it drifts at a constant base speed.
 *
 * This is the "velocity system" in practice — the marquee is coupled to the
 * user's input rather than running on an oblivious CSS timer, which is what
 * makes it read as physical.
 *
 * Implementation: the track is duplicated once and translated by exactly -50%,
 * so the seam is always off-screen and the loop is invisible. Position is
 * advanced manually per frame (not by a CSS animation) because a CSS keyframe
 * can't be nudged by velocity mid-flight.
 */

import { useRef, useState, useEffect, Children } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  wrap,
} from "framer-motion";
import { useSmoothScrollOptional } from "./SmoothScrollProvider";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: React.ReactNode;
  /** Base drift in % of track width per second. Negative runs right-to-left. */
  baseVelocity?: number;
  /** How strongly page scroll drives the strip. 0 disables the coupling. */
  scrollInfluence?: number;
  /** Lean the strip into its direction of travel, in degrees. */
  skew?: number;
  className?: string;
  /** Pause while hovered — lets users actually read the items. */
  pauseOnHover?: boolean;
};

export function Marquee({
  children,
  baseVelocity = -3,
  scrollInfluence = 4,
  skew = 0,
  className,
  pauseOnHover = true,
}: MarqueeProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const smooth = useSmoothScrollOptional();

  /**
   * The strip only animates while it is actually on screen and the tab is in
   * the foreground.
   *
   * `useAnimationFrame` otherwise runs for the lifetime of the page: this
   * component sits near the top of the home page, so it kept writing a
   * transform (and driving a spring) every frame for all ~10,000px of scrolling
   * below it, where it cannot be seen. Gating on visibility makes the work
   * proportional to what the user can actually perceive.
   */
  const root = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // `rootMargin` starts the drift just before the strip scrolls into view, so
    // it is never caught mid-stall at the moment it appears.
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const running = onScreen && tabVisible && !prefersReduced;

  const baseX = useMotionValue(0);
  const hovering = useRef(false);
  const directionFactor = useRef(1);

  // Lenis already publishes a *velocity* (signed px/frame) — it must not be
  // differentiated again with useVelocity, which would yield acceleration and
  // make the strip lurch on direction changes instead of tracking speed.
  //
  // Both motion values below are created unconditionally: `smooth` is null only
  // before the provider mounts, and swapping the spring's source once is safe,
  // whereas a conditional hook call is not.
  const fallbackVelocity = useMotionValue(0);
  const scrollVelocity = smooth?.velocity ?? fallbackVelocity;
  const smoothVelocity = useSpring(scrollVelocity, spring.scrub);

  // ±60 px/frame covers everything from a gentle wheel roll to a hard flick.
  const velocityFactor = useTransform(
    smoothVelocity,
    [-60, 0, 60],
    [-scrollInfluence, 0, scrollInfluence],
    { clamp: false }
  );

  // -50% is one full copy of the duplicated track.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const rotate = useTransform(
    velocityFactor,
    [-scrollInfluence, scrollInfluence],
    [-skew, skew],
    { clamp: true }
  );

  useAnimationFrame((_, delta) => {
    if (!running) return;
    if (pauseOnHover && hovering.current) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Scrolling backwards flips the strip's direction — the detail that sells
    // it as reactive rather than decorative.
    const v = velocityFactor.get();
    if (v < 0) directionFactor.current = -1;
    else if (v > 0) directionFactor.current = 1;

    moveBy += directionFactor.current * moveBy * v;
    baseX.set(baseX.get() + moveBy);
  });

  const items = Children.toArray(children);

  return (
    <div
      ref={root}
      className={cn("overflow-hidden whitespace-nowrap", className)}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      {/* `will-change` is applied only while the strip is actually moving.
          Left on permanently it pins a compositor layer for an element that is
          off-screen for most of the page. */}
      <motion.div
        className={cn("flex w-max flex-nowrap", running && "will-change-transform")}
        style={prefersReduced ? undefined : { x, rotate }}
      >
        {/* Two identical copies: the wrap at -50% lands the second copy exactly
            where the first began. Only the first is exposed to assistive tech. */}
        <div className="flex flex-nowrap">{items}</div>
        <div className="flex flex-nowrap" aria-hidden="true">
          {items}
        </div>
      </motion.div>
    </div>
  );
}
