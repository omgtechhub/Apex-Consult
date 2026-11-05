"use client";

/**
 * BackdropImage
 * -------------
 * A photographic layer that sits behind section content.
 *
 * Photography on a content section is a contrast problem before it is an
 * aesthetic one: a photo has bright and dark regions, and text laid straight
 * over it will pass contrast in some places and fail in others depending on
 * where the image happens to be light. So every backdrop here ships with a
 * scrim, and the scrim is not optional — `tone` picks which one, it cannot be
 * switched off.
 *
 * Three further decisions worth stating:
 *  - `aria-hidden` + empty alt. These are decorative; a screen reader
 *    announcing "students in a library" before the heading is noise.
 *  - `blurDataURL` comes from a 24px LQIP baked at build time, so the section
 *    has colour immediately instead of flashing an empty box.
 *  - Parallax is opt-in, and disabled under reduced motion (a background that
 *    drifts under fixed text is a common trigger) *and* on touch devices (see
 *    `ParallaxDriver`).
 */

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type RefObject } from "react";
import { spring } from "@/lib/motion";
import { useFinePointer } from "@/hooks/useFinePointer";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark" | "brand";

/**
 * Scrims.
 *
 * Two layers, and the split is the whole trick. A single flat wash strong
 * enough to protect text everywhere also erases the photograph everywhere —
 * which is exactly what an earlier version of this file did, veiling the image
 * to roughly 5% of itself. So instead:
 *
 *   1. a light *edge* gradient, densest top and bottom where headers and
 *      section seams need separation, and thinnest across the middle;
 *   2. a soft radial pool centred on the content column, which is the only
 *      place long-form text actually sits.
 *
 * The photo stays legible in the corners and behind the margins, and the type
 * still gets its contrast where it needs it.
 */
const scrims: Record<Tone, string> = {
  /*
    Cream sections.

    Deliberately light: the photograph is meant to be seen, not sensed. An
    earlier revision ran an opaque white pool across the middle of the section
    and, while it made every pixel of body text clear AA, it also read as a
    sheet laid over the picture — which is not a trade worth making on a page
    whose whole job is to feel considered.

    So the wash tops out around 45% and the centre only rises to 62%. Body copy
    over the busiest part of a photo can land near 3:1 rather than 4.5:1, which
    is why sections using this pass `textShadow` on their copy and why headings
    stay at ink-950. If a specific photo proves too restless behind text, dim
    that instance with `opacity` rather than making this heavier for everyone.
  */
  /* Defined in globals.css rather than inline, because this one has to follow
     the canvas between themes — a fixed white wash left near-white type on a
     near-white scrim in dark mode. See `.scrim-canvas`. */
  light: "scrim-canvas",
  // Ink sections. White type has far more headroom, so this stays light too.
  dark:
    "bg-[radial-gradient(ellipse_75%_58%_at_50%_50%,rgba(10,10,10,0.62)_0%,rgba(10,10,10,0.48)_60%,rgba(10,10,10,0.20)_100%),linear-gradient(to_bottom,rgba(10,10,10,0.50)_0%,rgba(10,10,10,0.28)_50%,rgba(10,10,10,0.55)_100%)]",
  // Ink + brand warmth, for the closing CTA.
  brand:
    "bg-[radial-gradient(ellipse_75%_58%_at_50%_50%,rgba(10,10,10,0.60)_0%,rgba(10,10,10,0.45)_60%,rgba(10,10,10,0.18)_100%),radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(99,3,3,0.22),transparent_70%),linear-gradient(to_bottom,rgba(10,10,10,0.48)_0%,rgba(10,10,10,0.26)_50%,rgba(10,10,10,0.52)_100%)]",
};

/**
 * ParallaxDriver
 * --------------
 * Owns the scroll → spring → transform chain and pipes the result into a
 * MotionValue its parent already renders. Renders no DOM of its own.
 *
 * It is a separate component purely so the chain can be *unmounted*, not merely
 * ignored. Hooks cannot be called conditionally, so while `useScroll` and
 * `useSpring` lived in `BackdropImage` a phone still paid for all of it — a
 * scroll listener, a spring stepping every frame, and a transform recomputed
 * per frame, once per backdrop on the page — to produce a drift that was then
 * thrown away. Rendering `null` from a conditional child is the only way to
 * actually skip the work. Measured on the home page, the hero and closing-CTA
 * bands were the only two places that dropped frames while scrolling, and they
 * are precisely the two sections with a parallaxing backdrop.
 *
 * Why it is skipped on touch rather than throttled: the layer being moved is a
 * full-viewport photograph, oversized a further 12%. Transforming it is cheap
 * in CPU terms and expensive in GPU terms — the compositor keeps a
 * viewport-sized texture live and re-filters it every frame, against a mobile
 * fill-rate and thermal budget. There is no amount of it that is free, so the
 * answer is none.
 *
 * The parent deliberately keeps its DOM identical either way, so the backdrop
 * enabling itself after hydration never remounts the `<Image>` underneath it
 * and never re-decodes the photograph.
 */
function ParallaxDriver({
  targetRef,
  parallax,
  output,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  parallax: number;
  output: MotionValue<string>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const damped = useSpring(scrollYProgress, spring.scrub);
  const y = useTransform(damped, [0, 1], ["0%", `${parallax * 100}%`]);

  useMotionValueEvent(y, "change", (latest) => output.set(latest));

  return null;
}

export function BackdropImage({
  src,
  blurDataURL,
  tone = "light",
  opacity = 1,
  parallax = 0,
  priority = false,
  className,
  position = "object-center",
}: {
  src: string;
  blurDataURL?: string;
  tone?: Tone;
  /**
   * Image opacity beneath the scrim.
   *
   * Default 1. The scrim already controls how present the photo reads, so
   * dimming here as well multiplies the two and is how a backdrop ends up
   * invisible. Reach for this only when a specific photo is too busy behind
   * its section, not as a general "make it subtle" dial.
   */
  opacity?: number;
  /** Drift distance as a fraction of section height. 0 disables. */
  parallax?: number;
  /** Set on the first above-the-fold image only. */
  priority?: boolean;
  className?: string;
  position?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const finePointer = useFinePointer();

  /**
   * The drift value is owned here and stays at rest unless a driver is mounted
   * to feed it, which keeps the element identity stable across hydration.
   */
  const drift = useMotionValue("0%");
  const drifts = parallax !== 0 && !prefersReduced && finePointer;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
    >
      {drifts && (
        <ParallaxDriver targetRef={ref} parallax={parallax} output={drift} />
      )}

      <motion.div
        /* No `style` at all when inert: an identity `translateY(0%)` would
           still promote the photograph to its own compositor layer, which is
           most of the cost this is avoiding. */
        style={drifts ? { y: drift } : undefined}
        /* Oversized so the parallax travel never exposes a bare edge. With no
           travel there is no edge to hide, and the image covers exactly. */
        className={cn("absolute inset-0", drifts && "-inset-y-[12%]")}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={priority}
          /**
           * `quality={60}`, not the default 75.
           *
           * Every backdrop on this site is viewed through the scrim above —
           * which at its densest point is roughly 73% black for `tone="dark"`.
           * JPEG artefacts at q=60 are below the threshold of visibility once
           * three quarters of the signal has been multiplied away, so the extra
           * fidelity in q=75 is paid for and then thrown out. Measured at
           * w=2048 on this project's own heroes, it is 30–40% of the transfer:
           *
           *   reading-room   q=75 391,880 B
           *   hero-library   q=75 317,617 B
           *
           * This is the hero photograph on every page, requested with
           * `priority`, so it is the first image the browser fetches and the
           * one the user is waiting on. 60 must be listed in
           * `images.qualities` in next.config.ts or Next coerces it back to 75
           * without warning.
           */
          quality={60}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          className={cn("object-cover", position)}
          style={{ opacity }}
        />
      </motion.div>

      {/* Scrim. Always present — see the note above. */}
      <div className={cn("absolute inset-0", scrims[tone])} />
    </div>
  );
}
