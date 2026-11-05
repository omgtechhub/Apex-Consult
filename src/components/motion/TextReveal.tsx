"use client";

/**
 * TextReveal
 * ----------
 * Masked, per-word type reveal — words rise out from behind a clipping edge
 * rather than fading in place.
 *
 * Accessibility: splitting text into spans destroys it for screen readers and
 * breaks text selection semantics. So the split copy is `aria-hidden` and the
 * original string is exposed once via `aria-label` on the wrapper. Assistive
 * tech reads one clean sentence; sighted users get the choreography.
 *
 * Reduced motion: falls back to a single opacity fade on the whole block — no
 * per-word travel, no stagger.
 */

import { motion, useReducedMotion } from "framer-motion";
import { ease, duration, stagger, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  /** Plain text. Markup is not supported by design — keep the split simple. */
  text: string;
  className?: string;
  /** Per-word delay. Longer text wants a tighter value. */
  each?: number;
  /** Seconds before the first word moves. */
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  repeat?: boolean;
  /**
   * `word` (default) masks and staggers each word individually.
   *
   * `line` masks the string as a single unit. Required for gradient text:
   * `background-clip: text` cannot paint across the `overflow: hidden`
   * inline-block that each word mask creates, so a gradient applied over
   * word-split text renders as nothing at all. Line mode keeps the text in one
   * box, so the gradient stays continuous — and it reads as a distinct
   * choreography, which is useful for accent lines.
   */
  mode?: "word" | "line";
};

export function TextReveal({
  text,
  className,
  each = stagger.tight,
  delay = 0,
  as = "span",
  repeat = false,
  mode = "word",
}: TextRevealProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const words = text.split(" ");
  const Wrapper = motion[as] as typeof motion.span;

  if (!prefersReduced && mode === "line") {
    return (
      /*
        Three nested spans, and each one is load-bearing:
          1. the mask — `overflow: hidden`, AND the viewport trigger,
          2. the animated span — transform only, no paint styling,
          3. the styled span — gradient/colour, never transformed.

        The trigger must live on the mask, not on the element that moves.
        IntersectionObserver clips an element's intersection rect against
        ancestor overflow, so a span parked at `y: 110%` inside an
        `overflow: hidden` parent reports *zero* visible area — it would never
        satisfy the threshold, and so would never run the animation that brings
        it into view. Observing the unclipped mask breaks that deadlock.

        Keeping the gradient off the animating span matters too: Chrome renders
        `background-clip: text` as blank when the same element is promoted to a
        composited layer, which a transform does.
      */
      <motion.span
        className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]"
        initial="hidden"
        whileInView="visible"
        viewport={{ ...viewport, once: !repeat, amount: 0.35 }}
      >
        <motion.span
          className="inline-block"
          variants={{
            hidden: { y: "110%", opacity: 0 },
            visible: {
              y: "0%",
              opacity: 1,
              transition: { duration: duration.slower, delay, ease: ease.entrance },
            },
          }}
        >
          <span className={className}>{text}</span>
        </motion.span>
      </motion.span>
    );
  }

  if (prefersReduced) {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ ...viewport, once: !repeat }}
        transition={{ duration: duration.fast }}
      >
        {text}
      </motion.span>
    );
  }

  return (
    /*
      `inline`, not `inline-block`.
      -------------------------------------------------------------------------
      An `inline-block` is an atomic inline-level box: its shrink-to-fit width
      is resolved against the *containing block*, not against the space left on
      the current line, so if the resulting box is wider than that remainder the
      whole box is pushed to the next line. Its words never get the chance to
      flow.

      That made every heading built from two TextReveals break as though a <br>
      sat between them, even where none did. Measured in a 455px column: the
      trust heading rendered "Built on trust," (191px) then dropped the entire
      "delivered with excellence." (350px) onto line two, leaving 264px of empty
      space on line one — enough for two more words. Deleting the real <br>
      changed nothing, because the inline-block was acting as a second one.

      `inline` lets the per-word spans join the parent's inline formatting
      context and wrap between themselves: the same heading becomes 393px / 148px.

      Safe here because this wrapper carries no transform of its own — it only
      orchestrates `staggerChildren`, and the words inside are each their own
      `inline-block` mask. `mode="line"` above must keep `inline-block`, since
      its mask needs `overflow: hidden`; that mode is therefore atomic by design
      and is reserved for short accent phrases.
    */
    <Wrapper
      className={cn("inline", className)}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewport, once: !repeat, amount: 0.35 }}
      transition={{ staggerChildren: each, delayChildren: delay }}
    >
      {words.map((word, i) => (
        // The outer span is the mask; the inner span is what travels.
        // `pb-[0.12em]` gives descenders (g, y, p) room so they aren't clipped.
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]"
        >
          {/* No manual `will-change` here either: Framer applies and then
              *removes* it around the animation, whereas a permanent hint leaves
              one composited layer per word for the life of the page. */}
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              visible: {
                y: "0%",
                opacity: 1,
                transition: { duration: duration.slower, ease: ease.entrance },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  );
}

/**
 * CharReveal
 * ----------
 * Per-character variant. Reserve this for short strings — eyebrows, badges,
 * stat labels. Splitting a paragraph per character costs hundreds of DOM nodes
 * and reads as noise rather than craft.
 */
export function CharReveal({
  text,
  className,
  each = 0.02,
  delay = 0,
  repeat = false,
}: Omit<TextRevealProps, "as">) {
  const prefersReduced = useReducedMotion() ?? false;

  if (prefersReduced) {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ ...viewport, once: !repeat }}
        transition={{ duration: duration.fast }}
      >
        {text}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={cn("inline-block", className)}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewport, once: !repeat, amount: 0.5 }}
      transition={{ staggerChildren: each, delayChildren: delay }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden="true"
          className="inline-block will-change-transform"
          variants={{
            hidden: { y: "0.4em", opacity: 0, filter: "blur(4px)" },
            visible: {
              y: "0em",
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: duration.slow, ease: ease.entrance },
            },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
