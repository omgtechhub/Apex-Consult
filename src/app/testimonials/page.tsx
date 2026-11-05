import type { Metadata } from "next";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { TextReveal } from "@/components/motion/TextReveal";
import { Counter } from "@/components/motion/Counter";
import { Tilt } from "@/components/motion/Tilt";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tactile } from "@/components/motion/Tactile";

import { SoftBreak } from "@/components/ui/SoftBreak";
export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read what 5,000+ satisfied clients say about Altivance Academic Consultancy. Real reviews from real students.",
};

const testimonials = [
  { name: "Adaeze Okonkwo", role: "MSc Public Health", university: "University of Lagos", initials: "AO", rating: 5, service: "Project Writing", content: "I was struggling with my dissertation for months. Altivance Academic Consultancy completely transformed it. The quality of research and writing was exceptional — I scored 87% and my supervisor was impressed. This is the best academic investment I have ever made.", featured: true },
  { name: "Emmanuel Adeyemi", role: "PhD Candidate", university: "Covenant University", initials: "EA", rating: 5, service: "Data Analysis", content: "Their SPSS analysis was incredibly thorough. They not only ran the analysis but explained every result in detail. My committee was impressed with the statistical rigor. Highly professional team.", featured: true },
  { name: "Fatima Al-Hassan", role: "MBA Student", university: "Ahmadu Bello University", initials: "FA", rating: 5, service: "Study Abroad", content: "I got accepted to three UK universities! The study abroad team guided me through everything — from choosing universities to visa documentation. Dream come true!", featured: true },
  { name: "Chibuzo Eze", role: "Final Year Student", university: "University of Nigeria Nsukka", initials: "CE", rating: 5, service: "Proofreading", content: "Turned in my project with zero grammatical errors and perfect formatting. The editor caught things I never would have seen. Fast turnaround — they delivered within 48 hours.", featured: false },
  { name: "Dr. Ngozi Ikenna", role: "Lecturer", university: "Federal University of Technology", initials: "NI", rating: 5, service: "Journal Formatting", content: "My paper was rejected twice before I approached Altivance. After their journal formatting service, it was accepted on the first submission. Professional and knowledgeable.", featured: false },
  { name: "Tunde Fashola", role: "Entrepreneur", university: "Corporate Client", initials: "TF", rating: 5, service: "Business Proposals", content: "Won a ₦50M contract with the proposal Altivance wrote for us. The writing was persuasive and well-researched. They understood our business perfectly.", featured: false },
  { name: "Kemi Adeyemo", role: "BSc Student", university: "Obafemi Awolowo University", initials: "KA", rating: 5, service: "Project Writing", content: "Booked a consultation on Monday, received my complete project draft by Thursday. Exceptional speed and quality! I got an A grade.", featured: false },
  { name: "Ibrahim Musa", role: "MSc Computer Science", university: "UNIABUJA", initials: "IM", rating: 5, service: "Data Analysis", content: "The Python data analysis was top-notch. They delivered clean, well-commented code with detailed explanations. My research project scored distinction level.", featured: false },
  { name: "Amaka Osei", role: "PhD Student", university: "University of Ghana / Studied in UK", initials: "AO", rating: 5, service: "Study Abroad", content: "Got a full scholarship to Warwick University thanks to Altivance's SOP and scholarship guidance. Worth every penny and more. Highly recommend!", featured: false },
  { name: "David Nnamdi", role: "Business Analyst", university: "Corporate Professional", initials: "DN", rating: 5, service: "Business Proposals", content: "The business proposal Altivance prepared for our startup secured us ₦10M in seed funding. The quality of the document was exceptional.", featured: false },
  { name: "Simi Adeleke", role: "PGD Student", university: "Lagos Business School", initials: "SA", rating: 5, service: "CV & SOP", content: "My CV and SOP were completely transformed. Within 2 weeks of sending applications with my new CV, I started getting interview invitations from top companies.", featured: false },
  { name: "Biodun Okafor", role: "MSc Economics", university: "University of Benin", initials: "BO", rating: 5, service: "Research Assistance", content: "Their research assistance was comprehensive and scholarly. My supervisor commented that my literature review was the best she had seen in years.", featured: false },
];

export default function TestimonialsPage() {
  const featured = testimonials.filter((t) => t.featured);
  const regular = testimonials.filter((t) => !t.featured);

  return (
    <div className="bg-canvas min-h-screen">
      <PageHero image="student-focus">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Reveal as="div" choreography="fade" duration={0.4}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400 mb-10">
            <Link href="/" className="hover:text-brand-500 transition-colors duration-200 ease-standard">Home</Link>
            <span>/</span>
            <span className="text-white">Testimonials</span>
          </nav>
        </Reveal>

        {/* Header */}
        <Stagger className="text-center max-w-xl mx-auto" each={0.1}>
          <StaggerItem choreography="blurRise">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
              <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Success Stories</span>
              <div className="w-8 h-px bg-gradient-to-l from-brand-500 to-transparent" />
            </div>
          </StaggerItem>

          <StaggerItem choreography="fade">
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-white leading-tight mb-4 text-balance">
              Real results.
              <SoftBreak />
              {/*
                Gradient text gets `mode="line"`. Per-word masking wraps each
                word in its own `overflow: hidden` box, and `background-clip:
                text` cannot paint a continuous gradient across those boxes —
                the words render as nothing at all. Line mode keeps the string
                in one paint context.
              */}
              <TextReveal
                text="Real people. Real excellence."
                mode="line"
                delay={0.15}
                className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
              />
            </h1>
          </StaggerItem>

          <StaggerItem choreography="blurRise" as="p" className="text-ink-300">
            Join 5,000+ students and professionals who have transformed their academic and
            professional journeys with Altivance Academic Consultancy.
          </StaggerItem>

          {/* Rating summary — stars pop in sequence, then the score counts up */}
          <StaggerItem choreography="rise">
            <div className="flex items-center justify-center gap-3 mt-6">
              <Stagger className="flex gap-1" each={0.06} delayChildren={0.1}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <StaggerItem key={i} choreography="scale" as="span">
                    <Star className="w-5 h-5 fill-accent-400 text-accent-600" />
                  </StaggerItem>
                ))}
              </Stagger>
              <span className="text-lg font-black text-white font-display">
                <Counter value={4.9} decimals={1} duration={1.4} />
              </span>
              <span className="text-sm text-ink-300">
                from <Counter value={5000} suffix="+" duration={1.6} /> reviews
              </span>
            </div>
          </StaggerItem>
        </Stagger>
        </div>
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        {/* Featured testimonials — the three dark cards carry the most weight,
            so they get depth (tilt + sheen) rather than a flat hover. */}
        <Stagger className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8" each={0.12}>
          {featured.map((t) => (
            <StaggerItem key={t.name} choreography="scale">
              <Tilt max={6} sheen lift={10} className="h-full">
                <div className="bg-surface rounded-3xl p-7 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-accent-400 text-accent-600" />
                      ))}
                      <span className="ml-2 text-[10px] text-ink-600 bg-brand-100 px-2 py-0.5 rounded-full">
                        {t.service}
                      </span>
                    </div>
                    <blockquote className="text-ink-600 text-sm leading-relaxed mb-6">
                      &ldquo;{t.content}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-on-brand font-bold text-xs">
                        {t.initials}
                      </div>
                      <div>
                        <div className="text-ink-950 font-semibold text-sm">{t.name}</div>
                        <div className="text-ink-500 text-xs">{t.role} · {t.university}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>

        {/*
          Regular testimonials — CSS multi-column masonry.

          Each card gets its own viewport trigger rather than sharing a
          <Stagger>. A single orchestrator on a container this tall would fire
          every card the moment 20% of the column scrolled in, so the last row
          would animate while it was still two screens below the fold. The
          delay is taken modulo 3 so cards sitting side by side feel staggered
          without cards further down inheriting a delay long enough to read as
          lag.
        */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {regular.map((t, i) => (
            <Reveal
              key={t.name}
              choreography="blurRise"
              delay={(i % 3) * 0.08}
              amount={0.15}
              className="break-inside-avoid mb-5"
            >
              <div className="group bg-surface border border-ink-200/60 rounded-2xl p-6 hover:border-brand-500/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-standard">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-accent-400 text-accent-600" />
                  ))}
                  <span className="ml-2 text-[10px] text-ink-500 bg-brand-100 px-2 py-0.5 rounded-full">
                    {t.service}
                  </span>
                </div>
                <blockquote className="text-sm text-ink-700 leading-relaxed mb-4">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-on-brand text-[10px] font-bold transition-transform duration-300 ease-overshoot group-hover:scale-110">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-ink-950 text-xs">{t.name}</div>
                    <div className="text-ink-500 text-[10px]">{t.role} · {t.university}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Stagger className="mt-16 text-center" each={0.08}>
          <StaggerItem choreography="rise">
            <h2 className="text-2xl font-black font-display text-ink-950 mb-3">
              Ready to write your success story?
            </h2>
          </StaggerItem>
          <StaggerItem choreography="rise" as="p" className="text-ink-600 mb-6 text-sm">
            Join thousands of successful students. Book your free consultation today.
          </StaggerItem>
          <StaggerItem choreography="scale">
            <Magnetic strength={0.25} contentStrength={0.4} className="inline-block">
              <Tactile
                href="/book"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl shadow-layered-brand"
              >
                Book Free Consultation
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-standard group-hover:translate-x-1" />
              </Tactile>
            </Magnetic>
          </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
}
