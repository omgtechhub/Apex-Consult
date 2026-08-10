/**
 * Apex Motion System
 * ------------------
 * A single source of truth for every animation in the product.
 *
 * Principles
 *  1. Motion explains, it does not decorate. Every animation answers
 *     "where did this come from?" or "what just changed?".
 *  2. Entrances decelerate, exits accelerate. Things arriving on screen
 *     ease out (fast → slow); things leaving ease in (slow → fast).
 *  3. Distance scales with size. Big elements travel further than small ones,
 *     so nothing feels like it teleports or crawls.
 *  4. Nothing animates layout. Only `transform`, `opacity`, `filter` and
 *     `clip-path` — all compositor-friendly.
 *  5. Reduced motion is a first-class path, not a disabled one. Users who opt
 *     out still get state changes, just without travel.
 */

import type { TargetAndTransition, Transition, Variants } from "framer-motion";

type Bezier = [number, number, number, number];

/* -------------------------------------------------------------------------- */
/*  Easing curves                                                             */
/* -------------------------------------------------------------------------- */

export const ease = {
  /** Material-standard. Safe default for state changes on small elements. */
  standard: [0.4, 0, 0.2, 1] as Bezier,
  /** Expo-out. The signature entrance curve — arrives fast, settles slowly. */
  entrance: [0.16, 1, 0.3, 1] as Bezier,
  /** Quint-out. Slightly softer than `entrance`; used for large surfaces. */
  silk: [0.22, 1, 0.36, 1] as Bezier,
  /** Expo-in. Exits — hesitates, then leaves decisively. */
  exit: [0.7, 0, 0.84, 0] as Bezier,
  /** Expo-in-out. Two-sided moves: drawers, page transitions, accordions. */
  emphasized: [0.83, 0, 0.17, 1] as Bezier,
  /** Gentle sine-ish curve for ambient/looping motion. */
  soft: [0.25, 0.46, 0.45, 0.94] as Bezier,
  /** Back-out. Tactile overshoot for press/pop feedback. Use sparingly. */
  overshoot: [0.34, 1.56, 0.64, 1] as Bezier,
} as const;

/* -------------------------------------------------------------------------- */
/*  Duration scale (seconds — Framer Motion's unit)                           */
/* -------------------------------------------------------------------------- */

export const duration = {
  /** Colour/opacity flips that should read as instant. */
  instant: 0.12,
  /** Hover and focus feedback. Must beat the eye's ~200ms fusion threshold. */
  fast: 0.2,
  /** Default for component state changes. */
  base: 0.35,
  /** Section reveals, accordions, dropdowns. */
  slow: 0.55,
  /** Hero entrances, page transitions. */
  slower: 0.8,
  /** Ambient/hero choreography only. Never block interaction this long. */
  slowest: 1.2,
} as const;

/* -------------------------------------------------------------------------- */
/*  Spring presets                                                            */
/* -------------------------------------------------------------------------- */

export const spring = {
  /** UI feedback: toggles, tabs, nav indicator. Settles in ~250ms. */
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
  /** General-purpose. Natural without visible bounce. */
  smooth: { type: "spring", stiffness: 220, damping: 28, mass: 1 },
  /** Large surfaces — drawers, modals, mega-menus. */
  gentle: { type: "spring", stiffness: 140, damping: 22, mass: 1 },
  /** Playful pop. Success states, badges, ripples. */
  bouncy: { type: "spring", stiffness: 500, damping: 18, mass: 0.9 },
  /** Pointer-following elements. Low mass so it tracks without lag. */
  magnetic: { type: "spring", stiffness: 260, damping: 22, mass: 0.6 },
  /** Scroll-linked values. Heavy damping kills scroll jitter. */
  scrub: { type: "spring", stiffness: 80, damping: 30, mass: 0.6, restDelta: 0.001 },
} satisfies Record<string, Transition>;

/* -------------------------------------------------------------------------- */
/*  Travel distances (px) — how far an element moves on entrance              */
/* -------------------------------------------------------------------------- */

export const travel = {
  xs: 8,
  sm: 16,
  md: 28,
  lg: 48,
  xl: 80,
} as const;

/* -------------------------------------------------------------------------- */
/*  Stagger rhythms (seconds between children)                                */
/* -------------------------------------------------------------------------- */

export const stagger = {
  /** Dense lists — nav items, chips, tags. */
  tight: 0.035,
  /** Default for card grids. */
  base: 0.06,
  /** Feature rows, pricing tiers. */
  loose: 0.1,
  /** Hero choreography. Each beat should be felt individually. */
  dramatic: 0.14,
} as const;

/* -------------------------------------------------------------------------- */
/*  Depth — z-translation + blur pairs for layered transitions                */
/* -------------------------------------------------------------------------- */

export const depth = {
  /** Recedes behind the incoming layer. */
  behind: { scale: 0.96, filter: "blur(4px)", opacity: 0 },
  /** Rests at the base plane. */
  base: { scale: 1, filter: "blur(0px)", opacity: 1 },
  /** Approaches from in front of the viewer. */
  front: { scale: 1.04, filter: "blur(6px)", opacity: 0 },
} as const;

/* -------------------------------------------------------------------------- */
/*  Viewport defaults for scroll-triggered reveals                            */
/* -------------------------------------------------------------------------- */

/**
 * `amount: 0.2` fires once a fifth of the element is visible — early enough
 * that the animation has finished by the time the user reads it.
 * `margin` pulls the trigger line up so tall sections don't fire at the very
 * bottom edge of the viewport.
 */
export const viewport = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -12% 0px",
} as const;

/* -------------------------------------------------------------------------- */
/*  Reveal choreographies                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Named entrance choreographies. Sections deliberately use *different* ones so
 * the page doesn't read as one repeated fade-up.
 */
export type Choreography =
  | "rise"
  | "blurRise"
  | "fall"
  | "slideLeft"
  | "slideRight"
  | "scale"
  | "blur"
  | "mask"
  | "clip"
  | "fold"
  | "fade";

const hidden: Record<Choreography, TargetAndTransition> = {
  rise: { opacity: 0, y: travel.md },
  /** Rise with a defocus. The hero's signature beat. */
  blurRise: { opacity: 0, y: travel.md, filter: "blur(8px)" },
  fall: { opacity: 0, y: -travel.md },
  slideLeft: { opacity: 0, x: travel.lg },
  slideRight: { opacity: 0, x: -travel.lg },
  scale: { opacity: 0, scale: 0.94 },
  blur: { opacity: 0, filter: "blur(12px)", scale: 1.02 },
  mask: { opacity: 0, y: "110%" },
  clip: { opacity: 1, clipPath: "inset(0 0 100% 0)" },
  fold: { opacity: 0, rotateX: -14, y: travel.sm, transformPerspective: 900 },
  fade: { opacity: 0 },
};

const shown: Record<Choreography, TargetAndTransition> = {
  rise: { opacity: 1, y: 0 },
  blurRise: { opacity: 1, y: 0, filter: "blur(0px)" },
  fall: { opacity: 1, y: 0 },
  slideLeft: { opacity: 1, x: 0 },
  slideRight: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  blur: { opacity: 1, filter: "blur(0px)", scale: 1 },
  mask: { opacity: 1, y: "0%" },
  clip: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
  fold: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 900 },
  fade: { opacity: 1 },
};

/**
 * Build a variant pair for a given choreography.
 *
 * When `reduced` is true the element still transitions between states — it just
 * does so with opacity alone, so screen content never appears without warning.
 */
export function revealVariants(
  choreography: Choreography = "rise",
  options: { delay?: number; duration?: number; reduced?: boolean } = {}
): Variants {
  const {
    delay = 0,
    duration: dur = duration.slow,
    reduced = false,
  } = options;

  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: duration.fast, delay: 0, ease: ease.standard },
      },
    };
  }

  return {
    hidden: hidden[choreography],
    visible: {
      ...shown[choreography],
      transition: { duration: dur, delay, ease: ease.entrance },
    },
  };
}

/**
 * Parent variant that orchestrates children. Children should use
 * `revealVariants(...)` with the same `hidden`/`visible` keys.
 */
export function staggerVariants(
  options: { each?: number; delayChildren?: number; reduced?: boolean } = {}
): Variants {
  const { each = stagger.base, delayChildren = 0, reduced = false } = options;

  /**
   * `opacity: 1` on both states is deliberate and load-bearing, not filler.
   *
   * A variant containing only a `transition` has no animatable value, so Framer
   * can treat the parent as having nothing to do — and when the parent doesn't
   * run, it never propagates `visible` to its children, leaving the whole group
   * stuck at `hidden`. Giving the orchestrator a real (no-op) property
   * guarantees it runs and the cascade fires.
   *
   * This is safe on a layout container, which is opaque either way.
   */
  return {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : each,
        delayChildren: reduced ? 0 : delayChildren,
      },
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Interaction presets — the tactile layer                                   */
/* -------------------------------------------------------------------------- */

/** Primary buttons: lift on hover, compress on press. */
export const tapScale = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.975, y: 0 },
  transition: spring.snappy,
} as const;

/** Cards: subtler lift — larger surfaces need less travel to read as raised. */
export const cardHover = {
  whileHover: { y: -6 },
  transition: spring.smooth,
} as const;

/** Icon buttons and chips. */
export const chipTap = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.96 },
  transition: spring.snappy,
} as const;

/* -------------------------------------------------------------------------- */
/*  Page transitions                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Route-level transition. The outgoing page recedes into `depth.behind` while
 * the incoming page rises from slightly below — reading as a forward push
 * rather than a crossfade.
 */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.slow, ease: ease.entrance },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: duration.fast, ease: ease.exit },
  },
};

export const pageVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.instant } },
};
