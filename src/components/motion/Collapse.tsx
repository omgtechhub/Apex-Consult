"use client";

/**
 * Collapse
 * --------
 * Height-animated disclosure region.
 *
 * Replaces the usual `max-h-0 → max-h-96` Tailwind trick, which has three
 * problems: content taller than the cap is silently clipped, the easing is
 * wrong because the transition runs over the *cap* rather than the real height,
 * and closing always looks faster than opening. Framer measures the real
 * content box, so the motion matches the content.
 *
 * `height` does cause layout, but on a disclosure that is unavoidable and
 * correct — the surrounding content genuinely has to move. The inner content
 * fades on a shorter, offset curve so text doesn't smear during the reflow.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

type CollapseProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  /** Wire to the trigger's `aria-controls`. */
  id?: string;
  /** Id of the button that toggles this region. */
  labelledBy?: string;
};

export function Collapse({
  open,
  children,
  className,
  id,
  labelledBy,
}: CollapseProps) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={id}
          role="region"
          aria-labelledby={labelledBy}
          className={className}
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { height: "auto", opacity: 1 },
            collapsed: { height: 0, opacity: 0 },
          }}
          transition={{
            height: {
              duration: prefersReduced ? 0 : duration.slow,
              ease: ease.emphasized,
            },
            opacity: {
              duration: prefersReduced ? 0 : duration.fast,
              // Fade in late on open, out early on close, so the text is only
              // visible while the box is near full height.
              delay: open && !prefersReduced ? duration.fast : 0,
            },
          }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
