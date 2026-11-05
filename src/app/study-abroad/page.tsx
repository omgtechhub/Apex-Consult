import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, GraduationCap, FileText, Award, CheckCircle2, Plane } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BackdropImage } from "@/components/motion/BackdropImage";
import { blur } from "@/lib/imageBlur";
import { TextReveal } from "@/components/motion/TextReveal";
import { Counter } from "@/components/motion/Counter";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tactile } from "@/components/motion/Tactile";

import { SoftBreak } from "@/components/ui/SoftBreak";
export const metadata: Metadata = {
  title: "Study Abroad Consultancy | Altivance Academic Consultancy",
  description:
    "Complete study abroad guidance — university selection, applications, visa documentation, scholarship, SOP writing. Get admitted to your dream university.",
};

const steps = [
  { icon: Globe, title: "University Selection", desc: "We match you with the best universities based on your profile, goals, and budget across UK, USA, Canada, Australia, and Europe." },
  { icon: FileText, title: "Application Strategy", desc: "A personalized application roadmap covering all requirements, deadlines, and strategies to maximize your acceptance chances." },
  { icon: Award, title: "SOP & CV Writing", desc: "Compelling Statement of Purpose and CV that tells your unique story and makes admissions officers take notice." },
  { icon: GraduationCap, title: "Scholarship Applications", desc: "Identify and apply for scholarships worth thousands of dollars — we've helped students win full scholarships." },
  { icon: CheckCircle2, title: "Visa Documentation", desc: "Complete visa application support — from document preparation to interview coaching for guaranteed success." },
  { icon: Plane, title: "Pre-Departure Support", desc: "Accommodation, travel, finances, and everything you need to confidently start your international journey." },
];

const countries = [
  { flag: "🇬🇧", name: "United Kingdom", universities: "150+ Universities", popular: ["Oxford", "Cambridge", "Imperial", "UCL", "Manchester"] },
  { flag: "🇺🇸", name: "United States", universities: "500+ Universities", popular: ["Harvard", "MIT", "Stanford", "NYU", "Michigan"] },
  { flag: "🇨🇦", name: "Canada", universities: "100+ Universities", popular: ["Toronto", "UBC", "McGill", "Waterloo", "Alberta"] },
  { flag: "🇦🇺", name: "Australia", universities: "40+ Universities", popular: ["Melbourne", "Sydney", "ANU", "UNSW", "Queensland"] },
  { flag: "🇩🇪", name: "Germany", universities: "Free Tuition", popular: ["TU Munich", "Heidelberg", "Berlin", "Hamburg"] },
  { flag: "🇮🇪", name: "Ireland", universities: "Post-study visa", popular: ["Trinity Dublin", "UCD", "NUI Galway"] },
];

const scholarships = [
  { name: "Chevening Scholarship", country: "UK", value: "Full funding", deadline: "November annually" },
  { name: "Commonwealth Scholarship", country: "UK", value: "Full funding", deadline: "December annually" },
  { name: "Fulbright Program", country: "USA", value: "Full funding", deadline: "October annually" },
  { name: "Vanier Canada", country: "Canada", value: "$50,000/year", deadline: "November annually" },
  { name: "Destination Australia", country: "Australia", value: "$15,000/year", deadline: "Varies" },
  { name: "DAAD Scholarship", country: "Germany", value: "Full funding", deadline: "Varies" },
];

/**
 * Hero stats. Split into parts so the number can count up while the prefix and
 * suffix stay put — animating "₦500M+" as a string would either scramble the
 * currency mark or force the whole label to fade instead of tick.
 */
const stats = [
  { value: 500, prefix: "", suffix: "+", label: "Successful Admissions" },
  { value: 50, prefix: "", suffix: "+", label: "Countries Covered" },
  { value: 500, prefix: "₦", suffix: "M+", label: "Scholarships Won" },
  { value: 98, prefix: "", suffix: "%", label: "Visa Success Rate" },
];

export default function StudyAbroadPage() {
  return (
    <div>
      {/* Hero */}
      {/* `accent-gold-fixed`: this band is a darkened photograph, so the accent
          is pinned to gold in BOTH themes — matching the home hero and
          `PageHero`. Red on a photographic ground does not blend (and #630303
          measures 1.27:1 on `surface-dark` outright); gold is the half of the
          palette built for dark grounds. Red on the white page body below is
          untouched. See globals.css. */}
      <section className="accent-gold-fixed pt-28 lg:pt-40 pb-20 lg:pb-28 bg-surface-dark relative overflow-hidden">
        <BackdropImage src="/images/graduates-joy.jpg" blurDataURL={blur["graduates-joy"]} tone="brand" parallax={0.08} position="object-[center_25%]" priority />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        {/* The atmospheric orb drifts slower than the page, which is what sells
            the sense of depth behind the headline. */}

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal choreography="fade" duration={0.4}>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-600 mb-10">
              <Link href="/" className="hover:text-brand-500 transition-colors duration-200 ease-standard">Home</Link>
              <span>/</span>
              <span className="text-ink-400">Study Abroad</span>
            </nav>
          </Reveal>

          <Stagger className="max-w-3xl" each={0.1}>
            <StaggerItem choreography="blurRise">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-brand-500" />
                <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Study Abroad</span>
              </div>
            </StaggerItem>

            <StaggerItem choreography="fade">
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black font-display text-white leading-tight mb-6 text-balance">
                Your dream
                <SoftBreak />
                {/* `mode="line"` — see the note on the testimonials headline:
                    per-word masks break `background-clip: text`. */}
                <TextReveal
                  text="university awaits."
                  mode="line"
                  delay={0.15}
                  className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
                />
              </h1>
            </StaggerItem>

            <StaggerItem choreography="blurRise" as="p" className="text-ink-400 text-lg leading-relaxed mb-10 max-w-xl">
              From university selection to visa approval — we guide you every step of the way.
              Our students have gained admission to Oxford, Cambridge, Harvard, MIT, and 200+
              other world-class universities.
            </StaggerItem>

            <StaggerItem choreography="rise">
              <div className="flex flex-wrap gap-4">
                <Magnetic strength={0.2} contentStrength={0.35}>
                  <Tactile
                    href="/book"
                    className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold rounded-xl shadow-layered-brand"
                  >
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-standard group-hover:translate-x-1" />
                  </Tactile>
                </Magnetic>
                <Tactile
                  href="https://wa.me/2347084321204"
                  external
                  rippleColor="rgba(255,255,255,0.25)"
                  className="flex items-center gap-2 px-6 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5"
                >
                  Chat with Advisor
                </Tactile>
              </div>
            </StaggerItem>
          </Stagger>

          {/* Success stats — numbers tick up as the row lands */}
          <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16" each={0.08}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label} choreography="scale">
                <div className="bg-white/5 border border-white/8 rounded-2xl p-5 text-center transition-colors duration-300 ease-standard hover:border-brand-500/30 hover:bg-white/[0.07]">
                  <div className="text-2xl font-black text-brand-500 font-display mb-1">
                    <Counter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      duration={1.6}
                    />
                  </div>
                  <div className="text-xs text-ink-600">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-canvas">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Stagger className="text-center max-w-xl mx-auto mb-14" each={0.08}>
            <StaggerItem choreography="blurRise">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
                <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Our Process</span>
                <div className="w-8 h-px bg-gradient-to-l from-brand-500 to-transparent" />
              </div>
            </StaggerItem>
            <StaggerItem choreography="rise">
              <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-black font-display text-ink-950 leading-tight text-balance">
                End-to-end study abroad support.
              </h2>
            </StaggerItem>
          </Stagger>

          {/* `fold` gives this grid its own signature — the cards hinge in from
              the top rather than rising, so the page doesn't repeat itself. */}
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" each={0.07}>
            {steps.map((step, i) => (
              <StaggerItem key={step.title} choreography="fold">
                <div className="bg-surface border border-ink-200/60 rounded-2xl p-7 hover:border-brand-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-standard group h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center group-hover:from-brand-400 group-hover:to-brand-500 transition-all duration-300 ease-standard group-hover:scale-110">
                      <step.icon className="w-5.5 h-5.5 text-brand-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-4xl font-black text-ink-100 font-display transition-colors duration-300 ease-standard group-hover:text-brand-100">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-bold text-ink-950 text-base mb-2 font-display">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Countries */}
      <section className="py-20 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal choreography="rise" className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-black font-display text-ink-950 leading-tight text-balance">
              Top destinations we serve.
            </h2>
          </Reveal>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" each={0.06}>
            {countries.map((country) => (
              <StaggerItem key={country.name} choreography="scale">
                <div className="bg-canvas border border-ink-200/60 rounded-2xl p-6 hover:border-brand-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-standard group h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl inline-block transition-transform duration-300 ease-overshoot group-hover:scale-110 group-hover:-rotate-6">
                      {country.flag}
                    </span>
                    <div>
                      <div className="font-bold text-ink-950 font-display">{country.name}</div>
                      <div className="text-xs text-brand-500 font-semibold">{country.universities}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {country.popular.map((uni) => (
                      <span
                        key={uni}
                        className="px-2 py-1 bg-surface border border-ink-200 rounded-full text-xs text-ink-600 transition-colors duration-200 ease-standard group-hover:border-brand-500/30"
                      >
                        {uni}
                      </span>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Scholarships */}
      <section className="py-20 bg-canvas">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Stagger className="text-center max-w-xl mx-auto mb-14" each={0.08}>
            <StaggerItem choreography="blurRise">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="w-4 h-4 text-brand-500" />
                <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Scholarships</span>
              </div>
            </StaggerItem>
            <StaggerItem choreography="fade">
              <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-black font-display text-ink-950 leading-tight text-balance">
                Win the scholarship
                <SoftBreak />
                <TextReveal
                  text="you deserve."
                  mode="line"
                  delay={0.1}
                  className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
                />
              </h2>
            </StaggerItem>
          </Stagger>

          {/* `slideRight` — a third distinct entrance for the third grid. */}
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" each={0.06}>
            {scholarships.map((s) => (
              <StaggerItem key={s.name} choreography="slideRight">
                <div className="bg-surface border border-ink-200/60 rounded-2xl p-6 hover:border-brand-500/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-standard h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-ink-950 text-sm font-display">{s.name}</div>
                      <div className="text-xs text-ink-500">{s.country}</div>
                    </div>
                    <div className="text-brand-500 font-bold text-sm text-right">{s.value}</div>
                  </div>
                  <div className="text-xs text-ink-400">Deadline: {s.deadline}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal choreography="scale" className="text-center mt-8">
            <Magnetic strength={0.25} contentStrength={0.4} className="inline-block">
              <Tactile
                href="/book"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl shadow-layered-brand"
              >
                Apply for Scholarship Guidance
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-standard group-hover:translate-x-1" />
              </Tactile>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface relative overflow-hidden">

        <Stagger className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center" each={0.09}>
          <StaggerItem choreography="blur">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-ink-950 mb-5 text-balance">
              Ready to study abroad?
            </h2>
          </StaggerItem>
          <StaggerItem choreography="rise" as="p" className="text-ink-600 mb-8 max-w-xl mx-auto">
            Book a free study abroad consultation and let our expert advisors create
            your personalized roadmap to international education success.
          </StaggerItem>
          <StaggerItem choreography="scale">
            <Magnetic strength={0.3} contentStrength={0.45} className="inline-block">
              <Tactile
                href="/book"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-bold text-base rounded-2xl shadow-layered-brand"
              >
                Book Free Consultation
                <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-standard group-hover:translate-x-1" />
              </Tactile>
            </Magnetic>
          </StaggerItem>
        </Stagger>
      </section>
    </div>
  );
}
