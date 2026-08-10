"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tactile } from "@/components/motion/Tactile";
import { BackdropImage } from "@/components/motion/BackdropImage";
import { blur } from "@/lib/imageBlur";
import { ease, spring, stagger } from "@/lib/motion";

const features = [
  {
    title: "Quick Turnaround",
    desc: "Get your work done in as little as 24-48 hours",
    emoji: "⚡",
  },
  {
    title: "Expert Matching",
    desc: "Matched with a specialist in your exact field",
    emoji: "🎯",
  },
  {
    title: "Guaranteed Satisfaction",
    desc: "Free revisions until you are 100% satisfied",
    emoji: "✅",
  },
];

export function CTASection() {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <section
      className="py-24 lg:py-32 bg-canvas relative overflow-hidden grain"
      aria-labelledby="cta-heading"
    >
      {/* Graduation caps against open sky — the outcome the page has spent
          every preceding section arguing for. Placed at the decision point on
          purpose. The `gold` scrim is near-opaque: this is emotional texture
          under the copy, not a photo the user is meant to study. */}
      <BackdropImage
        src="/images/caps-sky.jpg"
        blurDataURL={blur["caps-sky"]}
        tone="light"
        parallax={-0.1}
        position="object-[center_35%]"
      />

      {/* Decorative elements. The grid drops to 8% now that a photograph sits
          behind it — at 20% it read as dirt over the image rather than texture. */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.08]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      {/* The glow drifts *against* the scroll and breathes on its own timer, so
          the final section never settles into a still frame while the user is
          deciding whether to convert. */}

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <Reveal choreography="scale">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-100 border border-gold-500/30 mb-8">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-gold-500"
                animate={prefersReduced ? undefined : { opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: ease.soft }}
              />
              <span className="text-gold-500 text-xs font-bold tracking-wider uppercase">
                Ready to get started?
              </span>
            </div>
          </Reveal>

          <h2
            id="cta-heading"
            className="text-[clamp(2.5rem,5vw,4.5rem)] font-black font-display text-ink-950 leading-[1.05] mb-6"
          >
            <TextReveal text="Your academic success" />
            <br />
            <TextReveal
              text="starts today."
              delay={0.15}
              className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
              mode="line"
            />
          </h2>

          <Reveal choreography="rise" delay={0.2}>
            <p className="text-ink-600 text-lg leading-relaxed mb-12 text-pretty">
              Join thousands of students who have transformed their academic careers with
              Apex Academic Consultancy. Book a free consultation now.
            </p>
          </Reveal>

          {/* CTA options */}
          <Stagger
            each={stagger.loose}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <StaggerItem choreography="rise" className="w-full sm:w-auto">
              <Magnetic strength={0.3}>
                <Tactile
                  href="/book"
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-bold text-base rounded-2xl shadow-layered-gold w-full sm:w-auto overflow-hidden"
                >
                  <Calendar className="w-5 h-5" />
                  Book Free Consultation
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-[var(--ease-entrance)] group-hover:translate-x-1" />
                </Tactile>
              </Magnetic>
            </StaggerItem>

            <StaggerItem choreography="rise" className="w-full sm:w-auto">
              <Tactile
                href="https://wa.me/2347084321204?text=Hello%20Apex%20Academic%20Consultancy!%20I%20need%20help%20with%20my%20academic%20work."
                external
                rippleColor="rgba(255,255,255,0.18)"
                className="flex items-center justify-center gap-3 px-8 py-4 glass text-ink-950 font-semibold text-base rounded-2xl w-full sm:w-auto overflow-hidden transition-colors duration-300 hover:border-gold-500/30"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                Chat on WhatsApp
              </Tactile>
            </StaggerItem>
          </Stagger>

          {/* Quick contact options */}
          <Reveal choreography="fade" delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a
                href="tel:+2347084321204"
                className="flex items-center gap-2 text-ink-600 hover:text-gold-500 text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                +234 708 432 1204
              </a>
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <span className="text-ink-600 text-sm">Available 7 days · 8am - 10pm WAT</span>
              <span className="w-1 h-1 rounded-full bg-ink-300" />
              <span className="text-ink-600 text-sm">Free 15-min consultation</span>
            </div>
          </Reveal>
        </div>

        {/* Bottom feature cards — `fold` gives the closing row its own beat
            rather than repeating the rise used everywhere above. */}
        <Stagger
          each={stagger.loose}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20"
        >
          {features.map((feature) => (
            <StaggerItem key={feature.title} choreography="fold">
              <motion.div
                className="h-full bg-surface border border-ink-200/60 rounded-2xl p-6 text-center transition-colors duration-200 hover:border-gold-500/30"
                whileHover={prefersReduced ? undefined : { y: -6, backgroundColor: "rgba(255,255,255,0.07)" }}
                transition={spring.smooth}
              >
                <motion.div
                  className="text-3xl mb-3"
                  whileHover={prefersReduced ? undefined : { scale: 1.18, rotate: -6 }}
                  transition={spring.bouncy}
                >
                  {feature.emoji}
                </motion.div>
                <h3 className="text-ink-950 font-semibold text-sm mb-1.5">{feature.title}</h3>
                <p className="text-ink-600 text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
