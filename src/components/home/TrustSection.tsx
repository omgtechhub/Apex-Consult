"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Shield, Clock, Award, Star, CheckCircle2 } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Counter } from "@/components/motion/Counter";
import { duration, ease, spring, stagger } from "@/lib/motion";

import { SoftBreak } from "@/components/ui/SoftBreak";
const trustPillars = [
  {
    icon: Shield,
    title: "100% Confidential",
    desc: "Your work and personal information are protected with enterprise-grade security and strict confidentiality agreements.",
    color: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    desc: "We understand deadlines are sacred. Our team is committed to delivering every project on time, every time.",
    color: "from-green-50 to-green-100",
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
  {
    icon: Award,
    title: "Expert Team",
    desc: "Our consultants hold advanced degrees from top universities across Nigeria, UK, USA, and Canada.",
    color: "from-brand-100 to-brand-200",
    iconColor: "text-brand-500",
    iconBg: "bg-brand-100",
  },
  {
    icon: CheckCircle2,
    title: "100% Original Work",
    desc: "Every document is written from scratch and verified through industry-leading plagiarism detection software.",
    color: "from-purple-50 to-purple-100",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
];

// Durations in seconds. Bigger numbers get longer runs so every counter
// finishes at roughly the same moment rather than 5,000 still climbing while
// 7 has been sitting idle for a second.
const metrics = [
  { value: 5000, suffix: "+", label: "Happy Clients", duration: 2.2 },
  { value: 98, suffix: "%", label: "Satisfaction Rate", duration: 1.9 },
  { value: 7, suffix: "+", label: "Years Experience", duration: 1.6 },
  { value: 50, suffix: "+", label: "Partner Universities", duration: 2.0 },
];

export function TrustSection() {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <section
      className="py-24 lg:py-32 bg-canvas relative overflow-hidden"
      aria-labelledby="trust-heading"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      {/* Drifts against the scroll so the dark band reads as having depth
          behind it rather than being a flat panel. */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metrics — the numbers scale up from 0.8 as they count, so the
            counting reads as the number arriving rather than a value ticking. */}
        <Stagger each={stagger.loose} className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {metrics.map((metric) => (
            <StaggerItem key={metric.label} choreography="scale" className="text-center">
              {/* The number sits in an `inline-grid` on top of an invisible
                  sizer holding the final value, so the cell is already as wide
                  as "5,000+" will ever be and the count-up cannot change the
                  element's width mid-run.

                  Reserving the width structurally is what lets the figures stay
                  proportional. The previous fix was `tabular-nums`, which holds
                  a stable width by forcing every glyph — the comma included —
                  into the same 39.6px box; that padded "5,000+" ~11% wider than
                  its natural width with conspicuous air around the comma, and no
                  amount of negative tracking could reclaim the comma's box.
                  Proportional figures give the font's own letter-fit, so the
                  digits read as a single number rather than four spaced glyphs. */}
              <div className="text-5xl lg:text-6xl font-black font-display mb-2 tracking-tight">
                <span className="inline-grid justify-items-center">
                  <span aria-hidden="true" className="invisible [grid-area:1/1]">
                    {`${metric.value.toLocaleString("en-US")}${metric.suffix}`}
                  </span>
                  {/* Accent tokens, not literal hex: `--color-accent-*` is red in
                      light mode and yellow in dark (see globals.css), so the
                      gradient follows the theme the way the surrounding copy does
                      instead of staying red on the dark ground. */}
                  <span
                    className="[grid-area:1/1] text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, var(--color-accent-400) 0%, var(--color-accent-500) 50%, var(--color-accent-700) 100%)",
                    }}
                  >
                    <Counter
                      value={metric.value}
                      suffix={metric.suffix}
                      duration={metric.duration}
                    />
                  </span>
                </span>
              </div>
              <div className="text-ink-600 text-sm font-medium tracking-wide">
                {metric.label}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Section header — the two rules draw outward from the eyebrow */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal choreography="fade" className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              className="h-px bg-gradient-to-r from-brand-500 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: 32 }}
              viewport={{ once: true }}
              transition={{ duration: duration.slow, ease: ease.silk }}
            />
            <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">
              Why Choose Us
            </span>
            <motion.div
              className="h-px bg-gradient-to-l from-brand-500 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: 32 }}
              viewport={{ once: true }}
              transition={{ duration: duration.slow, ease: ease.silk }}
            />
          </Reveal>

          <h2
            id="trust-heading"
            className="text-[clamp(1.75rem,3.5vw,3rem)] font-black font-display text-ink-950 leading-tight mb-4"
          >
            <TextReveal text="Built on trust," />
            <SoftBreak />
            <TextReveal
              text="delivered with excellence."
              delay={0.1}
              className="text-brand-500"
            />
          </h2>

          <Reveal choreography="rise" delay={0.2}>
            <p className="text-ink-600 text-base leading-relaxed text-pretty">
              We don&apos;t just complete assignments — we build academic confidence that lasts
              a lifetime. Here&apos;s what sets us apart.
            </p>
          </Reveal>
        </div>

        {/* Trust pillars — `fold` rather than another rise, so this grid reads
            as a distinct beat from the metrics above it. */}
        <Stagger each={stagger.loose} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trustPillars.map((pillar) => (
            <StaggerItem key={pillar.title} choreography="fold">
              <motion.div
                className="group relative h-full bg-surface border border-ink-200/60 rounded-2xl p-8 transition-colors duration-300 hover:bg-ink-50 hover:border-brand-500/30 overflow-hidden"
                whileHover={prefersReduced ? undefined : { y: -4 }}
                transition={spring.smooth}
              >
                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl ${pillar.iconBg} flex items-center justify-center mb-5`}
                  whileHover={prefersReduced ? undefined : { scale: 1.12, rotate: 5 }}
                  transition={spring.bouncy}
                >
                  <pillar.icon className={`w-6 h-6 ${pillar.iconColor}`} />
                </motion.div>

                <h3 className="text-ink-950 font-bold text-xl font-display mb-3">
                  {pillar.title}
                </h3>
                <p className="text-ink-600 text-sm leading-relaxed">{pillar.desc}</p>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 40px rgba(99,3,3,0.05)" }}
                />
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Featured testimonial — arrives as one surface (`scale`), then its
            contents resolve inside it. A card whose children animate in
            separately from the card itself reads as assembled, not delivered. */}
        <Reveal
          choreography="scale"
          className="mt-12 relative bg-gradient-to-br from-brand-500/10 to-brand-700/5 border border-brand-500/30 rounded-3xl p-8 lg:p-12 overflow-hidden grain"
        >
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-1">
              <Stagger each={0.07} className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StaggerItem key={i} choreography="scale" as="span">
                    <Star className="w-5 h-5 fill-accent-400 text-accent-600" />
                  </StaggerItem>
                ))}
              </Stagger>

              <blockquote className="text-ink-950 text-xl lg:text-2xl font-medium font-display leading-relaxed mb-6 text-pretty">
                &ldquo;Altivance Academic Consultancy transformed my research project from a
                confused draft to a distinction-worthy dissertation. The expertise and
                attention to detail is unmatched in Nigeria.&rdquo;
              </blockquote>

              <Reveal choreography="slideRight" delay={0.1}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-on-brand font-bold">
                    A
                  </div>
                  <div>
                    <div className="text-ink-950 font-semibold text-sm">Adaeze Okonkwo</div>
                    <div className="text-ink-600 text-xs">
                      MSc Public Health, University of Lagos
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <Stagger each={stagger.base} className="flex-shrink-0 grid grid-cols-2 gap-3">
              {[
                { value: "98%", label: "Project Score" },
                { value: "3 Days", label: "Turnaround" },
                { value: "0%", label: "Plagiarism" },
                { value: "1st Class", label: "Result" },
              ].map((stat) => (
                <StaggerItem key={stat.label} choreography="scale">
                  <motion.div
                    className="bg-white/8 border border-white/10 rounded-xl p-4 text-center"
                    whileHover={prefersReduced ? undefined : { scale: 1.04, y: -2 }}
                    transition={spring.snappy}
                  >
                    <div className="text-brand-500 font-black text-xl font-display">
                      {stat.value}
                    </div>
                    <div className="text-ink-600 text-xs mt-1">{stat.label}</div>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
