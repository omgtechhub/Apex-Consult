"use client";

/**
 * Form motion primitives
 * ----------------------
 * Validation feedback, success confirmation, and submit-state transitions.
 *
 * Guiding rule: motion in a form must carry information, never decorate. An
 * error that shakes tells you *which* field failed without reading; a
 * checkmark that draws itself confirms the request actually completed. Anything
 * that doesn't communicate state is left still.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */

/**
 * Animated validation message.
 *
 * The container animates height so surrounding fields reflow smoothly instead
 * of jumping, and the text shakes once on arrival to draw the eye. `role=alert`
 * means screen readers announce it the moment it appears — the shake is the
 * visual equivalent of that announcement, not a replacement for it.
 */
export function FieldError({ message }: { message?: string }) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: prefersReduced ? 0 : duration.base, ease: ease.emphasized }}
          style={{ overflow: "hidden" }}
        >
          <motion.p
            role="alert"
            className="text-red-500 text-xs mt-1"
            animate={prefersReduced ? undefined : { x: [0, -5, 5, -3, 3, 0] }}
            transition={{ duration: 0.4, ease: ease.standard }}
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Success confirmation.
 *
 * The ring springs in, then the tick strokes itself on. Drawing the check
 * rather than fading it in reads as the system completing an action, which is
 * exactly what the user needs confirmed at this moment.
 */
export function SuccessCheck({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <motion.div
      className={cn(
        "w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center mx-auto shadow-layered-gold",
        className
      )}
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={prefersReduced ? { duration: 0 } : spring.bouncy}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-8 h-8"
        aria-hidden="true"
      >
        <motion.path
          d="M4 12.5L9.5 18L20 6.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: prefersReduced ? 0 : 0.45,
            delay: prefersReduced ? 0 : 0.18,
            ease: ease.entrance,
          }}
        />
      </svg>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Submission failure banner.
 *
 * Both forms previously swallowed network errors in an empty `catch`, leaving
 * the user staring at a button that had simply stopped spinning with no
 * indication of what happened. This surfaces the failure and offers the
 * fallback channel.
 */
export function SubmitError({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: prefersReduced ? 0 : duration.base, ease: ease.emphasized }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Cross-fades a submit button's label between idle and pending states.
 *
 * `mode="wait"` plus a fixed-height row keeps the button from resizing as the
 * label swaps — a button that changes width mid-submit reads as a glitch.
 */
export function SubmitLabel({
  pending,
  idle,
  busy,
}: {
  pending: boolean;
  idle: React.ReactNode;
  busy: React.ReactNode;
}) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={pending ? "busy" : "idle"}
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: prefersReduced ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: prefersReduced ? 0 : -6 }}
        transition={{ duration: prefersReduced ? 0 : duration.fast, ease: ease.entrance }}
      >
        {pending ? busy : idle}
      </motion.span>
    </AnimatePresence>
  );
}
