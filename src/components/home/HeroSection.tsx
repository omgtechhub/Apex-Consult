"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, CheckCircle2, Star, ChevronDown } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { BackdropImage } from "@/components/motion/BackdropImage";
import { blur } from "@/lib/imageBlur";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tactile } from "@/components/motion/Tactile";
import { useSmoothScroll } from "@/components/motion/SmoothScrollProvider";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { duration, ease, spring, stagger, travel } from "@/lib/motion";

const floatingStats = [
  { value: "5,000+", label: "Clients Served", icon: "🎓" },
  { value: "98%", label: "Satisfaction Rate", icon: "⭐" },
  { value: "50+", label: "Universities", icon: "🏛️" },
];

const trustedBy = [
  "University of Lagos",
  "Covenant University",
  "OAU",
  "UNIABUJA",
  "LASU",
  "University of Ibadan",
];

/**
 * A single hero entrance beat.
 *
 * Self-contained on purpose: `initial` + `animate` on the element itself, with
 * the delay derived from its index. It cannot depend on a parent running, and
 * it has no viewport trigger to miss.
 */
function Beat({
  index,
  children,
  className,
  as = "div",
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
  as?: "div" | "p";
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const Component = as === "p" ? motion.p : motion.div;

  const hidden = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, y: travel.md, filter: "blur(8px)" };
  const shown = prefersReduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <Component
      className={className}
      initial={hidden}
      animate={shown}
      transition={{
        duration: prefersReduced ? duration.fast : duration.slower,
        delay: prefersReduced ? 0 : 0.15 + index * stagger.dramatic,
        ease: ease.entrance,
      }}
    >
      {children}
    </Component>
  );
}

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const { scrollTo } = useSmoothScroll();

  /**
   * Pointer parallax as MotionValues. The previous implementation stored the
   * pointer in `useState`, re-rendering this entire subtree on every
   * `mousemove` — roughly 120 React renders per second of cursor movement on a
   * trackpad. Nothing below re-renders now; the orbs are driven straight on the
   * compositor.
   */
  const pointer = usePointerParallax(heroRef);

  // Cards nearer the "front" travel further, which is what sells the depth.
  const cardX = useTransform(pointer.x, [-0.5, 0.5], [18, -18]);
  const cardY = useTransform(pointer.y, [-0.5, 0.5], [12, -12]);

  /**
   * Scroll-out: the hero recedes as the next section arrives, so the two never
   * read as sliding past each other on the same plane.
   */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const damped = useSpring(scrollYProgress, spring.scrub);
  const contentY = useTransform(damped, [0, 1], [0, -40]);

  /**
   * The hero content used to fade and shrink to nothing as you scrolled — it
   * reached zero opacity at 65% of the section, so the headline was already
   * half-gone while still filling most of the screen. Reading it during a slow
   * scroll was genuinely hard.
   *
   * Now only a gentle upward drift remains: enough parallax for the next
   * section to feel like it arrives on a nearer plane, with the copy at full
   * opacity the whole way. Depth should never cost legibility.
   */
  const depthStyle = prefersReduced ? undefined : { y: contentY };

  /** The scroll cue still fades — once you are scrolling, it has done its job. */
  const cueOpacity = useTransform(damped, [0, 0.35], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-surface-dark pt-24 pb-16"
      aria-label="Hero section"
    >
      {/*
        Photographic ground.

        It sits *under* the existing orb field rather than replacing it — the
        gradient system is the brand, the photograph is depth behind it.

        The scrim is dark, and that decision drives the rest of the section:
        white type on a darkened photograph separates far more cleanly than ink
        on a lightened one, because a light wash has to fight every bright
        region of the image while a dark wash only deepens them. That is why the
        headline, copy, chips and floating cards below are all on their light
        variants, and why the section ground is ink rather than canvas.
      */}
      <BackdropImage
        src="/images/hero-library.jpg"
        blurDataURL={blur["hero-library"]}
        tone="dark"
        parallax={0.12}
        priority
      />

      {/*
        Background texture.

        The two large blurred colour orbs that used to live here are gone. They
        were bright blooms pulsing on a 14s and 18s loop, and against the dark
        photographic ground they stopped reading as ambient depth and started
        reading as glare — the kind of slow, constant luminance change that
        makes the eyes water because they never settle on a fixed exposure.

        The photograph now supplies all the depth this section needs. Only the
        grid remains, and it does not animate after its initial fade.
      */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-grid-pattern"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.14 }}
          transition={{ duration: duration.slowest, ease: ease.silk }}
        />
      </div>

      {/* Floating accent elements */}
      <motion.div
        className="absolute top-32 left-[8%] hidden xl:block animate-float"
        style={prefersReduced ? undefined : { x: cardX, y: cardY }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: duration.slower, delay: 0.9, ease: ease.entrance }}
      >
        <div className="glass-dark rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white text-sm">
              🎓
            </div>
            <div>
              <div className="text-xs font-bold text-white">PhD Approved</div>
              <div className="text-[10px] text-ink-400">University of Lagos</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-48 right-[6%] hidden xl:block animate-float"
        style={prefersReduced ? undefined : { x: cardX, y: cardY }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: duration.slower, delay: 1.05, ease: ease.entrance }}
      >
        <div className="glass-dark rounded-2xl p-4 shadow-lg [animation-delay:1s]">
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 1.2 + i * 0.06,
                  ...spring.bouncy,
                }}
              >
                <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
              </motion.span>
            ))}
          </div>
          <div className="text-xs font-bold text-white">Excellent service!</div>
          <div className="text-[10px] text-ink-400">— Adaeze O., MSc Student</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-40 left-[5%] hidden xl:block animate-float [animation-delay:2s]"
        style={prefersReduced ? undefined : { x: cardX, y: cardY }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: duration.slower, delay: 1.2, ease: ease.entrance }}
      >
        <div className="bg-gradient-to-br from-gold-500 to-gold-700 rounded-2xl p-4 shadow-lg text-white">
          <div className="text-2xl font-bold font-display">98%</div>
          <div className="text-[10px] opacity-80 mt-0.5">Success Rate</div>
        </div>
      </motion.div>

      {/* Main content.
          Two elements, deliberately: the outer one owns the scroll-linked
          depth (MotionValues in `style`), the inner one owns the entrance
          orchestration (variants). Combining them on a single element makes
          Framer treat its values as externally driven and skip the variant
          animation — which silently takes the child cascade with it, leaving
          every beat stuck at `hidden`. */}
      <motion.div
        className="relative z-10 w-full"
        style={depthStyle}
      >
      {/*
        The hero deliberately does NOT use <Stagger> or any variant cascade.

        It is the first thing every visitor sees, and it has now been blanked
        twice by orchestration failing silently — once because a parent variant
        holding only a `transition` never ran and so never propagated, and once
        because it was being driven incidentally by the page-transition wrapper.
        Both failures were invisible: no error, just no content.

        So each beat below animates itself, on mount, with an explicit delay via
        <Beat>. No parent, no propagation, no viewport trigger — nothing that can
        quietly decline to fire. It's less elegant than a stagger container and
        that is the point: above-the-fold content should have the dumbest,
        most predictable path to being visible.
      */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <Beat index={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark shadow-sm mb-8" >
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse-gold" />
          <span className="text-xs font-semibold text-ink-100 tracking-wide">
            Nigeria&apos;s #1 Academic Consultancy
          </span>
        </Beat>

        {/* Headline — masked per-word rise. The gradient word is kept as its own
            element so the background-clip isn't split across word spans. */}
        <Beat index={1} >
          <h1 className="font-display font-black text-[clamp(2.5rem,7vw,6.5rem)] leading-[1.05] tracking-tight text-white text-balance mb-6">
            <TextReveal text="Where" delay={0.1} />{" "}
            <span className="relative inline-block">
              <TextReveal
                text="Academic"
                delay={0.18}
                className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
                mode="line"
              />
              {/* Underline draws itself once the word has landed */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M2 8C50 4 150 10 298 4"
                  stroke="url(#gold-line)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: prefersReduced ? 0 : 0.9,
                    delay: prefersReduced ? 0 : 0.85,
                    ease: ease.silk,
                  }}
                />
                <defs>
                  <linearGradient id="gold-line" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#e8b84b" />
                    <stop offset="100%" stopColor="#a07812" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            <TextReveal text="Excellence" delay={0.32} className="text-white" />{" "}
            <TextReveal text="Meets Results" delay={0.4} className="text-ink-300" />
          </h1>
        </Beat>

        {/* Subheadline */}
        <Beat index={2} as="p" className="text-[clamp(1rem,2vw,1.25rem)] text-ink-300 leading-relaxed max-w-2xl mx-auto mb-10 text-pretty" >
          From project writing to PhD research, study abroad to scholarship applications —
          we turn your academic ambitions into tangible achievements.
        </Beat>

        {/* CTAs */}
        <Beat index={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14" >
          <Magnetic strength={0.28}>
            <Tactile
              href="/book"
              className="group flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold text-base rounded-2xl shadow-layered-gold overflow-hidden"
            >
              Book Free Consultation
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center transition-colors duration-200 group-hover:bg-white/30">
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-[var(--ease-entrance)] group-hover:translate-x-0.5" />
              </span>
            </Tactile>
          </Magnetic>
          <Tactile
            href="/services"
            rippleColor="rgba(201,152,26,0.16)"
            className="flex items-center gap-2 px-7 py-4 bg-surface border border-ink-200 text-ink-950 font-semibold text-base rounded-2xl overflow-hidden transition-colors duration-300 hover:border-gold-500/40 hover:bg-surface"
          >
            Explore Services
          </Tactile>
        </Beat>

        {/* Trust indicators */}
        <Beat index={4} className="flex flex-col items-center gap-4" >
          <div className="flex items-center gap-4">
            {["Project Writing", "Research Assistance", "Study Abroad", "Data Analysis"].map(
              (service, i) => (
                <motion.span
                  key={service}
                  className="flex items-center gap-1.5 text-sm text-ink-300"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 1.1 + i * stagger.tight,
                    duration: duration.base,
                    ease: ease.entrance,
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  <span className="hidden sm:inline">{service}</span>
                </motion.span>
              )
            )}
          </div>
        </Beat>

        {/* Stats strip */}
        <Beat index={5} className="mt-16 grid grid-cols-3 max-w-lg mx-auto gap-8" >
          {floatingStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white font-display mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-ink-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </Beat>

        {/* Trusted by strip */}
        <Beat index={6} className="mt-16" >
          <p className="text-xs text-ink-400 uppercase tracking-[0.15em] font-semibold mb-4">
            Students from top institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustedBy.map((uni, i) => (
              <motion.span
                key={uni}
                className="px-3 py-1.5 glass-dark rounded-full text-xs text-ink-300 font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 1.35 + i * stagger.tight,
                  ...spring.smooth,
                }}
              >
                {uni}
              </motion.span>
            ))}
          </div>
        </Beat>
      </div>
      </motion.div>

      {/* Scroll indicator — routed through Lenis so the jump is interpolated
          rather than instant, and so it can't fight the smooth-scroll loop. */}
      {/* Two layers on purpose: the outer div owns the scroll-linked fade, the
          inner button owns its entrance. Putting a scroll-driven `opacity` in
          `style` on the same element would statically override the `animate`
          opacity and the entrance would never be seen. */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={prefersReduced ? undefined : { opacity: cueOpacity }}
      >
        <motion.button
          onClick={() => scrollTo("#services-overview", { offset: -80 })}
          className="flex flex-col items-center gap-2 text-ink-400 transition-colors hover:text-gold-500 group"
          aria-label="Scroll to services"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: duration.slow, ease: ease.entrance }}
        >
          <span className="text-[10px] tracking-widest uppercase font-medium">
            Explore
          </span>
          <motion.span
            animate={prefersReduced ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: ease.soft }}
          >
            <ChevronDown className="w-4 h-4 group-hover:text-gold-500" />
          </motion.span>
        </motion.button>
      </motion.div>
    </section>
  );
}
