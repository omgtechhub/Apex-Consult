"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { duration, ease, spring, stagger } from "@/lib/motion";

const AUTOPLAY_MS = 6000;

const testimonials = [
  {
    id: 1,
    name: "Adaeze Okonkwo",
    role: "MSc Public Health",
    university: "University of Lagos",
    initials: "AO",
    rating: 5,
    service: "Project Writing",
    content:
      "I was struggling with my dissertation for months. Apex Academic Consultancy completely transformed it. The quality of research and writing was exceptional — I scored 87% and my supervisor was impressed. This is the best academic investment I have ever made.",
  },
  {
    id: 2,
    name: "Emmanuel Adeyemi",
    role: "PhD Candidate",
    university: "Covenant University",
    initials: "EA",
    rating: 5,
    service: "Data Analysis (SPSS)",
    content:
      "Their SPSS analysis was incredibly thorough. They not only ran the analysis but explained every result in detail. My committee was impressed with the statistical rigor. Highly professional team with genuine expertise.",
  },
  {
    id: 3,
    name: "Fatima Al-Hassan",
    role: "MBA Student",
    university: "Ahmadu Bello University",
    initials: "FA",
    rating: 5,
    service: "Study Abroad",
    content:
      "I got accepted to three UK universities! The study abroad team guided me through everything — from choosing universities to visa documentation. Their SOP writing service is worth every penny. Dream come true!",
  },
  {
    id: 4,
    name: "Chibuzo Eze",
    role: "Final Year Student",
    university: "University of Nigeria Nsukka",
    initials: "CE",
    rating: 5,
    service: "Proofreading",
    content:
      "Turned in my project with zero grammatical errors and perfect formatting. The editor caught things I never would have seen. Fast turnaround — they delivered within 48 hours. Will definitely use again for my masters.",
  },
  {
    id: 5,
    name: "Dr. Ngozi Ikenna",
    role: "Lecturer & Researcher",
    university: "Federal University of Technology",
    initials: "NI",
    rating: 5,
    service: "Journal Formatting",
    content:
      "My paper was rejected twice before I approached Apex. After their journal formatting and revision service, it was accepted on the first submission. Professional, knowledgeable, and worth every naira spent.",
  },
  {
    id: 6,
    name: "Tunde Fashola",
    role: "Corporate Professional",
    university: "Entrepreneur",
    initials: "TF",
    rating: 5,
    service: "Business Proposals",
    content:
      "Won a ₦50M contract with the proposal Apex wrote for us. The writing was persuasive, well-researched, and professional. They understood our business perfectly and articulated our value proposition better than we could have.",
  },
];

/**
 * Slides travel in the direction of navigation — forward pushes content in from
 * the right, back from the left. A carousel that always animates the same way
 * loses the sense of position in a sequence.
 */
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48, filter: "blur(6px)" }),
};

export function TestimonialsSection() {
  const [[active, direction], setActive] = useState<[number, number]>([0, 1]);
  const [autoplay, setAutoplay] = useState(true);
  const prefersReduced = useReducedMotion() ?? false;

  const paginate = useCallback((next: number, dir: number) => {
    setActive([(next + testimonials.length) % testimonials.length, dir]);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setAutoplay(false);
      setActive(([current]) => [index, index > current ? 1 : -1]);
    },
    []
  );

  useEffect(() => {
    if (!autoplay || prefersReduced) return;
    const timer = setInterval(() => paginate(active + 1, 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay, active, paginate, prefersReduced]);

  // Arrow keys are the expected control for a carousel once it has focus.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setAutoplay(false);
      paginate(active - 1, -1);
    } else if (e.key === "ArrowRight") {
      setAutoplay(false);
      paginate(active + 1, 1);
    }
  };

  const current = testimonials[active];

  return (
    <section
      className="py-24 lg:py-32 bg-surface relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal choreography="fade" className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              className="h-px bg-gradient-to-r from-gold-500 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: 32 }}
              viewport={{ once: true }}
              transition={{ duration: duration.slow, ease: ease.silk }}
            />
            <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">
              Testimonials
            </span>
            <motion.div
              className="h-px bg-gradient-to-l from-gold-500 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: 32 }}
              viewport={{ once: true }}
              transition={{ duration: duration.slow, ease: ease.silk }}
            />
          </Reveal>

          <h2
            id="testimonials-heading"
            className="text-[clamp(2rem,4vw,3rem)] font-black font-display text-ink-950 leading-tight mb-4"
          >
            <TextReveal text="5,000+ students trust" />
            <br />
            <TextReveal
              text="Apex Academic."
              delay={0.12}
              className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
              mode="line"
            />
          </h2>

          <Reveal choreography="rise" delay={0.2}>
            <p className="text-ink-600 text-base">
              Real results. Real people. Real academic excellence.
            </p>
          </Reveal>
        </div>

        {/* Main testimonial */}
        <Reveal choreography="scale" className="max-w-4xl mx-auto mb-12">
          <div
            className="relative bg-canvas border border-ink-200/60 rounded-3xl p-8 lg:p-12 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-4"
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
            onKeyDown={onKeyDown}
            onPointerEnter={() => setAutoplay(false)}
            onFocus={() => setAutoplay(false)}
          >
            {/* Quote icon */}
            <div className="absolute top-6 right-8 text-gold-200 pointer-events-none">
              <Quote className="w-16 h-16 opacity-40" />
            </div>

            {/* `mode="wait"` keeps only one quote in the box at a time —
                `popLayout` would overlap two blocks of text mid-transition. */}
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={prefersReduced ? undefined : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: duration.base, ease: ease.entrance }}
                aria-live="polite"
                aria-atomic="true"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-gold-500 text-gold-500" />
                  ))}
                  <span className="ml-2 text-xs font-medium text-ink-600 bg-gold-100 px-2 py-0.5 rounded-full">
                    {current.service}
                  </span>
                </div>

                {/* Content */}
                <blockquote className="text-ink-950 text-xl lg:text-2xl font-medium font-display leading-relaxed mb-8 text-pretty">
                  &ldquo;{current.content}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {current.initials}
                  </div>
                  <div>
                    <div className="font-bold text-ink-950 font-display">{current.name}</div>
                    <div className="text-sm text-ink-600">
                      {current.role} · {current.university}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress bar. Keyed to `active` so it restarts per slide, and
                driven by the same AUTOPLAY_MS the timer uses — the previous
                version showed position in the list, not time until advance,
                so the bar and the actual transition never agreed. */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-200">
              <motion.div
                key={`${active}-${autoplay}`}
                className="h-full origin-left bg-gradient-to-r from-gold-400 to-gold-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: autoplay && !prefersReduced ? AUTOPLAY_MS / 1000 : 0.3,
                  ease: autoplay && !prefersReduced ? "linear" : ease.entrance,
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                // Width is animated rather than swapped between `w-2`/`w-8`
                // classes, so the active pill grows into place instead of
                // snapping between two sizes.
                <motion.button
                  key={t.id}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-colors duration-300",
                    i === active ? "bg-gold-500" : "bg-ink-200 hover:bg-gold-500/40"
                  )}
                  animate={{ width: i === active ? 32 : 8 }}
                  transition={spring.snappy}
                  aria-label={`Go to testimonial ${i + 1} of ${testimonials.length}`}
                  aria-current={i === active}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => {
                  setAutoplay(false);
                  paginate(active - 1, -1);
                }}
                whileHover={prefersReduced ? undefined : { scale: 1.06, x: -2 }}
                whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                transition={spring.snappy}
                className="w-10 h-10 rounded-xl border border-ink-200 flex items-center justify-center transition-colors hover:border-gold-500/40 hover:bg-gold-100/30"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4 text-ink-600" />
              </motion.button>
              <motion.button
                onClick={() => {
                  setAutoplay(false);
                  paginate(active + 1, 1);
                }}
                whileHover={prefersReduced ? undefined : { scale: 1.06, x: 2 }}
                whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                transition={spring.snappy}
                className="w-10 h-10 rounded-xl border border-ink-200 flex items-center justify-center transition-colors hover:border-gold-500/40 hover:bg-gold-100/30"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4 text-ink-600" />
              </motion.button>
            </div>
          </div>
        </Reveal>

        {/* Mini testimonials grid */}
        <Stagger
          each={stagger.loose}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {testimonials
            .filter((_, i) => i !== active)
            .slice(0, 3)
            .map((t) => (
              <StaggerItem key={t.id} choreography="rise">
                <motion.button
                  onClick={() => goTo(testimonials.indexOf(t))}
                  whileHover={prefersReduced ? undefined : { y: -4 }}
                  transition={spring.smooth}
                  className="w-full h-full text-left bg-canvas border border-ink-200/60 rounded-2xl p-5 transition-colors duration-200 hover:border-gold-500/30 hover:shadow-layered group"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed line-clamp-2 mb-3 transition-colors group-hover:text-ink-950">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ink-950">{t.name}</div>
                      <div className="text-[10px] text-ink-500">{t.role}</div>
                    </div>
                  </div>
                </motion.button>
              </StaggerItem>
            ))}
        </Stagger>
      </div>
    </section>
  );
}
