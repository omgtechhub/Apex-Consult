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
 *  - Parallax is opt-in and disabled under reduced motion, because a
 *    background that drifts under fixed text is a common trigger.
 */

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark" | "gold";

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
  light:
    "bg-[radial-gradient(ellipse_72%_55%_at_50%_50%,rgba(250,249,247,0.62)_0%,rgba(250,249,247,0.45)_60%,rgba(250,249,247,0.10)_100%),linear-gradient(to_bottom,rgba(250,249,247,0.45)_0%,rgba(250,249,247,0.18)_50%,rgba(250,249,247,0.50)_100%)]",
  // Ink sections. White type has far more headroom, so this stays light too.
  dark:
    "bg-[radial-gradient(ellipse_75%_58%_at_50%_50%,rgba(10,10,10,0.62)_0%,rgba(10,10,10,0.48)_60%,rgba(10,10,10,0.20)_100%),linear-gradient(to_bottom,rgba(10,10,10,0.50)_0%,rgba(10,10,10,0.28)_50%,rgba(10,10,10,0.55)_100%)]",
  // Ink + brand warmth, for the closing CTA.
  gold:
    "bg-[radial-gradient(ellipse_75%_58%_at_50%_50%,rgba(10,10,10,0.60)_0%,rgba(10,10,10,0.45)_60%,rgba(10,10,10,0.18)_100%),radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(201,152,26,0.22),transparent_70%),linear-gradient(to_bottom,rgba(10,10,10,0.48)_0%,rgba(10,10,10,0.26)_50%,rgba(10,10,10,0.52)_100%)]",
};

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

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const damped = useSpring(scrollYProgress, spring.scrub);
  const y = useTransform(damped, [0, 1], ["0%", `${parallax * 100}%`]);

  const drift = prefersReduced || parallax === 0 ? undefined : { y };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
    >
      <motion.div
        style={drift}
        /* Oversized so the parallax travel never exposes a bare edge. */
        className={cn("absolute inset-0", parallax !== 0 && !prefersReduced && "-inset-y-[12%]")}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={priority}
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
