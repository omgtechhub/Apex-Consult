"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tactile } from "@/components/motion/Tactile";
import { duration, ease, spring, stagger } from "@/lib/motion";

const steps = [
  {
    number: "01",
    title: "Book a Consultation",
    desc: "Schedule a free 15-minute consultation call or send us a WhatsApp message describing your needs.",
    detail: "Available 7 days a week, morning to night.",
    color: "#c9981a",
  },
  {
    number: "02",
    title: "Get Your Custom Quote",
    desc: "We assess your requirements and provide a transparent, no-hidden-fee quote within 24 hours.",
    detail: "Fair pricing with multiple payment options.",
    color: "#c9981a",
  },
  {
    number: "03",
    title: "Work Begins",
    desc: "Our specialist expert is assigned to your project and work begins immediately upon confirmation.",
    detail: "You get progress updates throughout.",
    color: "#c9981a",
  },
  {
    number: "04",
    title: "Review & Refine",
    desc: "Review the delivered work and request any revisions until you are completely satisfied.",
    detail: "Unlimited revisions included.",
    color: "#c9981a",
  },
  {
    number: "05",
    title: "Achieve Excellence",
    desc: "Submit your work with full confidence, knowing it meets the highest academic standards.",
    detail: "Post-submission support available.",
    color: "#c9981a",
  },
];

export function ProcessSection() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion() ?? false;

  /**
   * The connector line is *drawn by scrolling* rather than revealed on entry.
   * Progress is bound to the timeline column's own scroll range, so the line's
   * tip tracks roughly the step the reader is looking at — the section
   * literally advances as they advance through it.
   */
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 65%", "end 60%"],
  });
  const lineScale = useSpring(scrollYProgress, spring.scrub);

  return (
    <section
      className="py-24 lg:py-32 bg-canvas relative overflow-hidden"
      aria-labelledby="process-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          {/* Left - sticky heading */}
          <div className="lg:sticky lg:top-32 lg:w-80 flex-shrink-0">
            <Reveal choreography="fade" className="flex items-center gap-2 mb-4">
              <motion.div
                className="h-px bg-gradient-to-r from-gold-500 to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: true }}
                transition={{ duration: duration.slow, ease: ease.silk }}
              />
              <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">
                How It Works
              </span>
            </Reveal>

            <h2
              id="process-heading"
              className="text-[clamp(2rem,4vw,3rem)] font-black font-display text-ink-950 leading-tight mb-6"
            >
              <TextReveal text="From idea to" />
              <br />
              <TextReveal
                text="excellence,"
                delay={0.1}
                className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
                mode="line"
              />
              <br />
              <TextReveal text="in 5 steps." delay={0.2} />
            </h2>

            <Reveal choreography="rise" delay={0.25}>
              <p className="text-ink-600 text-base leading-relaxed mb-8 text-pretty">
                Our streamlined process ensures you get the best results with the least
                hassle. We handle the complexity so you can focus on your goals.
              </p>
            </Reveal>

            <Reveal choreography="rise" delay={0.32}>
              <Magnetic strength={0.25}>
                <Tactile
                  href="/book"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold text-sm rounded-xl shadow-layered-gold overflow-hidden"
                >
                  Start Now
                  <ArrowRight className="w-4 h-4" />
                </Tactile>
              </Magnetic>
            </Reveal>
          </div>

          {/* Right - steps */}
          <div ref={timelineRef} className="relative flex-1">
            {/* Scroll-drawn connector. Rendered once behind all five steps
                rather than as a fragment per step, so it can be a single
                continuous scaleY with no seams between rows.
                Inset by the marker's centre (24px) and its height (48px). */}
            {!prefersReduced && (
              <div
                aria-hidden="true"
                className="absolute left-6 top-14 bottom-14 w-px -translate-x-1/2 bg-ink-200/60"
              >
                <motion.div
                  className="h-full w-full origin-top bg-gradient-to-b from-gold-500 via-gold-500 to-gold-400"
                  style={{ scaleY: lineScale, willChange: "transform" }}
                />
              </div>
            )}

            <div className="relative space-y-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  className="relative flex gap-6 pb-10 last:pb-0 group"
                  initial={{ opacity: 0, x: 32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: duration.slow,
                    delay: i * stagger.tight,
                    ease: ease.entrance,
                  }}
                >
                  {/* Static fallback connector for reduced motion */}
                  {prefersReduced && i < steps.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-px bg-gradient-to-b from-gold-500/30 to-transparent" />
                  )}

                  {/* Step number. Solid background so the drawn line passes
                      behind the marker rather than through the digits. */}
                  <motion.div
                    className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-surface border-2 border-ink-200 group-hover:border-gold-500/50 group-hover:bg-gold-100/30 flex items-center justify-center transition-colors duration-300 shadow-sm"
                    whileHover={prefersReduced ? undefined : { scale: 1.1 }}
                    transition={spring.bouncy}
                  >
                    <span className="text-xs font-black text-gold-500 tracking-tight font-display">
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-ink-950 font-bold text-lg font-display mb-2 transition-colors group-hover:text-gold-500">
                      {step.title}
                    </h3>
                    <p className="text-ink-600 text-sm leading-relaxed mb-2 text-pretty">
                      {step.desc}
                    </p>
                    <motion.div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100/60 border border-gold-200/50"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * stagger.tight + 0.2,
                        ...spring.smooth,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                      <span className="text-[10px] font-semibold text-gold-700">
                        {step.detail}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
