"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Collapse } from "@/components/motion/Collapse";
import { duration, ease, spring, stagger } from "@/lib/motion";

const faqs = [
  {
    q: "How do I get started with Apex Academic Consultancy?",
    a: "Simply book a free 15-minute consultation through our website, send us a WhatsApp message at +234 708 432 1204, or fill out our contact form. We'll assess your needs and provide a custom quote within 24 hours.",
  },
  {
    q: "Is the work you deliver 100% original and plagiarism-free?",
    a: "Absolutely. Every piece of work is written from scratch specifically for each client. We run all documents through industry-leading plagiarism detection software (Turnitin and Copyscape) before delivery, and we provide a plagiarism report upon request.",
  },
  {
    q: "How quickly can you complete my project?",
    a: "Turnaround times depend on the complexity and length of the project. Proofreading and editing can be completed within 24-48 hours. Research projects and dissertations typically take 5-14 days. We also offer rush services for urgent deadlines.",
  },
  {
    q: "What subjects and academic levels do you cover?",
    a: "We cover virtually all academic disciplines including Sciences, Social Sciences, Humanities, Business, Engineering, Medicine, Law, and more. Our team includes specialists with BSc, MSc, and PhD qualifications from top universities across Nigeria, UK, USA, and Canada.",
  },
  {
    q: "Is my information kept confidential?",
    a: "Yes, absolutely. Client confidentiality is our top priority. We never share your personal information or academic work with third parties. All our consultants sign strict NDAs, and your data is protected with enterprise-grade security.",
  },
  {
    q: "Do you offer study abroad and scholarship assistance?",
    a: "Yes! Our Study Abroad team provides end-to-end guidance including university selection, application strategy, Statement of Purpose writing, CV preparation, scholarship applications, and visa documentation support.",
  },
];

export function FAQPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <section
      className="py-24 lg:py-32 bg-canvas relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left */}
          <div className="lg:w-96 flex-shrink-0">
            <Reveal choreography="fade" className="flex items-center gap-2 mb-4">
              <motion.div
                className="h-px bg-gradient-to-r from-gold-500 to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: true }}
                transition={{ duration: duration.slow, ease: ease.silk }}
              />
              <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">
                FAQ
              </span>
            </Reveal>

            <h2
              id="faq-heading"
              className="text-[clamp(2rem,3.5vw,2.75rem)] font-black font-display text-ink-950 leading-tight mb-4"
            >
              <TextReveal text="Frequently" />
              <br />
              <TextReveal text="asked" delay={0.08} />
              <br />
              <TextReveal
                text="questions."
                delay={0.16}
                className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
                mode="line"
              />
            </h2>

            <Reveal choreography="rise" delay={0.2}>
              <p className="text-ink-600 text-sm leading-relaxed mb-6 text-pretty">
                Have more questions? We&apos;re here to help. Reach out via WhatsApp or book
                a free consultation.
              </p>
              <div className="space-y-3">
                <Link
                  href="/faq"
                  className="group flex items-center gap-2 text-sm font-semibold text-gold-500 transition-colors hover:text-gold-700"
                >
                  View all FAQs
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[var(--ease-entrance)] group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://wa.me/2347084321204"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-ink-600 transition-colors hover:text-ink-950"
                >
                  Or chat with us on WhatsApp →
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right — accordion.
              Heights are measured by <Collapse> rather than transitioned to a
              `max-h-96` cap: the previous version silently clipped any answer
              taller than 24rem and eased against the cap instead of the
              content, so every panel closed faster than it opened. */}
          <Stagger each={stagger.tight} className="flex-1 space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <StaggerItem key={faq.q} choreography="rise">
                  <div
                    className={cn(
                      "bg-surface border rounded-2xl transition-colors duration-300",
                      isOpen
                        ? "border-gold-500/30 shadow-[0_4px_24px_rgba(201,152,26,0.08)]"
                        : "border-ink-200/60 hover:border-gold-500/20"
                    )}
                  >
                    <h3>
                      <button
                        id={`faq-trigger-${i}`}
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                      >
                        <span
                          className={cn(
                            "font-semibold text-sm leading-relaxed font-body transition-colors",
                            isOpen ? "text-gold-500" : "text-ink-950"
                          )}
                        >
                          {faq.q}
                        </span>
                        <motion.span
                          className="flex-shrink-0"
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={prefersReduced ? { duration: 0 } : spring.snappy}
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-colors",
                              isOpen ? "text-gold-500" : "text-ink-500"
                            )}
                          />
                        </motion.span>
                      </button>
                    </h3>

                    <Collapse
                      open={isOpen}
                      id={`faq-panel-${i}`}
                      labelledBy={`faq-trigger-${i}`}
                    >
                      <div className="px-6 pb-5 text-sm text-ink-600 leading-relaxed border-t border-ink-100 pt-4 text-pretty">
                        {faq.a}
                      </div>
                    </Collapse>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
