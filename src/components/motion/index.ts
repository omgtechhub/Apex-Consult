/**
 * Apex motion primitives — single import surface.
 *
 * Every component here is client-side and reduced-motion aware. Tokens live in
 * `@/lib/motion`; hooks live in `@/hooks`.
 */

export { Reveal, Stagger, StaggerItem } from "./Reveal";
export { TextReveal, CharReveal } from "./TextReveal";
export { Magnetic } from "./Magnetic";
export { Tilt } from "./Tilt";
export { Parallax } from "./Parallax";
export { Counter } from "./Counter";
export { Marquee } from "./Marquee";
export { Collapse } from "./Collapse";
export { Tactile } from "./Tactile";
export { ScrollProgress } from "./ScrollProgress";
export { FieldError, SubmitError, SubmitLabel, SuccessCheck } from "./FormMotion";
// GSAP-backed. Used only for pinning, which Framer Motion cannot express.
export { PinnedReveal, HorizontalScroll } from "./PinnedScroll";
export {
  SmoothScrollProvider,
  useSmoothScroll,
  useSmoothScrollOptional,
} from "./SmoothScrollProvider";
