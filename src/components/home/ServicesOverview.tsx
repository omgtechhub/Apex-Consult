"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileText, BookOpen, Globe, BarChart3, Award, Briefcase, GraduationCap, Users, PenTool, Book, Microscope, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Tilt } from "@/components/motion/Tilt";
import { duration, ease, spring, stagger } from "@/lib/motion";

import { SoftBreak } from "@/components/ui/SoftBreak";
const categories = [
  { id: "all", label: "All Services" },
  { id: "academic", label: "Academic" },
  { id: "research", label: "Research" },
  { id: "abroad", label: "Study Abroad" },
  { id: "professional", label: "Professional" },
];

const services = [
  {
    id: 1,
    icon: FileText,
    name: "Project Writing",
    shortDesc: "Complete academic projects crafted to perfection",
    desc: "From BSc to PhD dissertations, our expert writers deliver original, well-researched projects tailored to your institution's requirements.",
    category: "academic",
    badge: "Most Popular",
    href: "/services/project-writing",
    accent: "#630303",
  },
  {
    id: 2,
    icon: PenTool,
    name: "Project Editing & Proofreading",
    shortDesc: "Polish your work to publication standard",
    desc: "Expert editing, proofreading, and formatting services that transform good work into exceptional, submission-ready documents.",
    category: "academic",
    href: "/services/proofreading",
    accent: "#630303",
  },
  {
    id: 3,
    icon: Microscope,
    name: "Research Assistance",
    shortDesc: "Comprehensive research support at every stage",
    desc: "Literature reviews, research design, data collection frameworks, and theoretical guidance from subject matter experts.",
    category: "research",
    href: "/services/research-assistance",
    accent: "#630303",
  },
  {
    id: 4,
    icon: BarChart3,
    name: "Data Analysis (SPSS)",
    shortDesc: "Statistical analysis that speaks volumes",
    desc: "Advanced SPSS, R, STATA, and Python analysis with clear interpretation, tables, and charts for your research.",
    category: "research",
    badge: "High Demand",
    href: "/services/data-analysis",
    accent: "#630303",
  },
  {
    id: 5,
    icon: Globe,
    name: "Study Abroad Consultancy",
    shortDesc: "Your gateway to world-class universities",
    desc: "End-to-end guidance for international university applications, visa documentation, and scholarship applications.",
    category: "abroad",
    href: "/study-abroad",
    accent: "#630303",
  },
  {
    id: 6,
    icon: GraduationCap,
    name: "Admission Guidance",
    shortDesc: "Navigate university applications with confidence",
    desc: "Strategic guidance for undergraduate, postgraduate, and PhD applications to top universities worldwide.",
    category: "abroad",
    href: "/services/admission",
    accent: "#630303",
  },
  {
    id: 7,
    icon: Award,
    name: "Scholarship Guidance",
    shortDesc: "Win the funding you deserve",
    desc: "Identify, apply, and win scholarships with our expert guidance on essays, recommendations, and application strategy.",
    category: "abroad",
    href: "/services/scholarship",
    accent: "#630303",
  },
  {
    id: 8,
    icon: Book,
    name: "CV, SOP & Recommendation Letters",
    shortDesc: "Documents that open doors",
    desc: "Professionally crafted CVs, Statements of Purpose, and Recommendation Letters that make you stand out.",
    category: "professional",
    href: "/services/cv-sop",
    accent: "#630303",
  },
  {
    id: 9,
    icon: Briefcase,
    name: "Business Proposals",
    shortDesc: "Compelling proposals that win contracts",
    desc: "Well-structured, persuasive business proposals tailored to your industry and target audience.",
    category: "professional",
    href: "/services/business-proposals",
    accent: "#630303",
  },
  {
    id: 10,
    icon: FileSearch,
    name: "Journal Formatting & Publication",
    shortDesc: "Get published in top journals",
    desc: "Professional formatting to journal guidelines with guidance on submission, peer review, and publication.",
    category: "research",
    href: "/services/journal-formatting",
    accent: "#630303",
  },
  {
    id: 11,
    icon: BookOpen,
    name: "Assignment Assistance",
    shortDesc: "Expert help for every assignment",
    desc: "Individual and group assignment support across all disciplines with timely delivery guaranteed.",
    category: "academic",
    href: "/services/assignments",
    accent: "#630303",
  },
  {
    id: 12,
    icon: Users,
    name: "1-on-1 Consultation",
    shortDesc: "Personalized expert sessions",
    desc: "Book private consultation sessions with our academic experts for tailored guidance on your specific needs.",
    category: "professional",
    badge: "Premium",
    href: "/book",
    accent: "#630303",
  },
];

export function ServicesOverview() {
  const [activeCategory, setActiveCategory] = useState("all");
  const prefersReduced = useReducedMotion() ?? false;

  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <section
      id="services-overview"
      className="py-24 lg:py-32 bg-surface relative overflow-hidden"
      aria-labelledby="services-heading"
    >
      {/* The slowly-breathing background bloom that used to sit here has been
          removed. A large blurred colour field pulsing on a 16s loop never
          settles, and the eye keeps re-adjusting to it while trying to read the
          copy in front. Sections get their depth from layout and photography
          now, not from ambient glow. */}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — the rule draws left-to-right, then the eyebrow and
            headline arrive. Reads as a line being ruled before a title. */}
        <div className="max-w-3xl mb-16">
          <Reveal choreography="fade" className="flex items-center gap-2 mb-4">
            <motion.div
              className="h-px bg-gradient-to-r from-brand-500 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: 32 }}
              viewport={{ once: true }}
              transition={{ duration: duration.slow, ease: ease.silk }}
            />
            <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">
              What We Do
            </span>
          </Reveal>

          <h2
            id="services-heading"
            className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-ink-950 leading-tight mb-4"
          >
            <TextReveal text="Every academic need," />
            <SoftBreak />
            <TextReveal
              text="expertly handled."
              delay={0.12}
              className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
              mode="line"
            />
          </h2>

          <Reveal choreography="rise" delay={0.15}>
            <p className="text-ink-600 text-lg leading-relaxed text-pretty">
              From your first assignment to your final dissertation — we have the expertise,
              the tools, and the dedication to help you succeed.
            </p>
          </Reveal>
        </div>

        {/* Category filters. The active pill is a single shared element that
            slides between tabs via `layoutId`, rather than each button
            independently fading its own background in and out. */}
        <Stagger each={stagger.tight} className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <StaggerItem key={cat.id} choreography="scale">
                <motion.button
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={isActive}
                  whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                  transition={spring.snappy}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                    isActive ? "text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="service-filter-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 shadow-md"
                      transition={spring.snappy}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </motion.button>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Services grid.
            `popLayout` lets exiting cards leave the layout flow immediately so
            the remaining cards start closing the gap on the same frame, instead
            of waiting for the exit animation to finish. */}
        <motion.div
          layout={!prefersReduced}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((service, index) => (
              <motion.div
                key={service.id}
                layout={!prefersReduced}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: duration.fast } }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: duration.slow,
                  // Cap the cascade so card 12 doesn't wait most of a second.
                  delay: Math.min(index * stagger.base, 0.4),
                  ease: ease.entrance,
                }}
              >
                <Tilt max={5} lift={6} className="h-full rounded-2xl">
                  <Link
                    href={service.href}
                    className="group relative flex h-full flex-col bg-canvas border border-ink-200/60 rounded-2xl p-6 overflow-hidden card-shine transition-[border-color,box-shadow] duration-300 hover:border-brand-500/30 hover:shadow-layered"
                  >
                    {/* Badge */}
                    {service.badge && (
                      <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-wide">
                        {service.badge}
                      </div>
                    )}

                    {/* Icon — springs on hover so the card has a focal point */}
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:from-brand-400 group-hover:to-brand-500"
                      whileHover={prefersReduced ? undefined : { scale: 1.08, rotate: -4 }}
                      transition={spring.bouncy}
                    >
                      <service.icon className="w-5.5 h-5.5 text-brand-500 group-hover:text-white transition-colors duration-300" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="font-bold text-ink-950 text-base mb-2 font-display leading-tight transition-colors group-hover:text-brand-500">
                      {service.name}
                    </h3>
                    <p className="text-sm text-ink-500 leading-relaxed mb-4 line-clamp-2">
                      {service.desc}
                    </p>

                    {/* CTA — pinned to the bottom so cards of differing text
                        length still align on a single baseline */}
                    <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-brand-500">
                      Learn more
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[var(--ease-entrance)] group-hover:translate-x-1" />
                    </div>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </Tilt>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View all CTA */}
        <Reveal choreography="rise" className="mt-12 text-center">
          <Link
            href="/services"
            className="border-sweep inline-flex items-center gap-2 px-6 py-3 border border-brand-500/30 text-brand-500 font-semibold text-sm rounded-xl transition-all duration-200 hover:bg-brand-100/50 hover:border-brand-500/60"
          >
            View All 20+ Services
            <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-[var(--ease-entrance)] hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
