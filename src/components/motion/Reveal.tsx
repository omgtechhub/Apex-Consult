"use client";

/**
 * Reveal / Stagger
 * ----------------
 * The workhorses of scroll choreography.
 *
 * `<Reveal>` animates a single element in when it enters the viewport.
 * `<Stagger>` + `<StaggerItem>` orchestrate a group so children arrive in
 * sequence rather than all at once.
 *
 * Both accept a `choreography` so different sections of the page can reveal
 * differently — the whole point is to avoid a page that fade-ups eight times.
 */

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { createContext, useContext } from "react";
import {
  revealVariants,
  staggerVariants,
  viewport as defaultViewport,
  stagger as staggerTokens,
  duration as durationTokens,
  type Choreography,
} from "@/lib/motion";

/* -------------------------------------------------------------------------- */

type RevealProps = {
  children: React.ReactNode;
  /** Which entrance choreography to use. Defaults to `rise`. */
  choreography?: Choreography;
  /** Seconds to wait before starting. Ignored inside a <Stagger>. */
  delay?: number;
  /** Override the reveal duration. */
  duration?: number;
  /** Replay the animation every time the element re-enters the viewport. */
  repeat?: boolean;
  /** Fraction of the element that must be visible to trigger (0–1). */
  amount?: number;
  as?: "div" | "section" | "span" | "li" | "p" | "article" | "header" | "figure";
} & Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "children">;

/**
 * Set by <Stagger> so descendants know to inherit the parent's orchestration
 * instead of running their own viewport trigger.
 */
const StaggerContext = createContext(false);

export function Reveal({
  children,
  choreography = "rise",
  delay = 0,
  duration,
  repeat = false,
  amount,
  as = "div",
  ...rest
}: RevealProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const inStagger = useContext(StaggerContext);

  const variants = revealVariants(choreography, {
    delay,
    duration,
    reduced: prefersReduced,
  });

  const Component = motion[as] as typeof motion.div;

  // Inside a <Stagger>, the parent drives `visible` — don't self-trigger.
  if (inStagger) {
    return (
      <Component variants={variants} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        ...defaultViewport,
        once: !repeat,
        amount: amount ?? defaultViewport.amount,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/* -------------------------------------------------------------------------- */

type StaggerProps = {
  children: React.ReactNode;
  /** Seconds between each child. */
  each?: number;
  /** Seconds before the first child starts. */
  delayChildren?: number;
  repeat?: boolean;
  amount?: number;
  as?: "div" | "section" | "ul" | "ol" | "span";
} & Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "children">;

export function Stagger({
  children,
  each = staggerTokens.base,
  delayChildren = 0,
  repeat = false,
  amount,
  as = "div",
  ...rest
}: StaggerProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const Component = motion[as] as typeof motion.div;

  return (
    <StaggerContext.Provider value={true}>
      <Component
        variants={staggerVariants({ each, delayChildren, reduced: prefersReduced })}
        initial="hidden"
        whileInView="visible"
        viewport={{
          ...defaultViewport,
          once: !repeat,
          amount: amount ?? defaultViewport.amount,
        }}
        {...rest}
      >
        {children}
      </Component>
    </StaggerContext.Provider>
  );
}

/**
 * A child of <Stagger>. Identical to <Reveal> but always inherits orchestration.
 */
export function StaggerItem({
  children,
  choreography = "rise",
  duration,
  as = "div",
  ...rest
}: Omit<RevealProps, "delay" | "repeat" | "amount">) {
  const prefersReduced = useReducedMotion() ?? false;
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      variants={revealVariants(choreography, {
        duration: duration ?? durationTokens.slow,
        reduced: prefersReduced,
      })}
      {...rest}
    >
      {children}
    </Component>
  );
}
