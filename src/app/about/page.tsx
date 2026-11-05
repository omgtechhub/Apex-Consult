import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Award, Globe, BookOpen, Users } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BackdropImage } from "@/components/motion/BackdropImage";
import { blur } from "@/lib/imageBlur";
import { TextReveal } from "@/components/motion/TextReveal";
import { Tactile } from "@/components/motion/Tactile";
import { Tilt } from "@/components/motion/Tilt";
import { stagger } from "@/lib/motion";

import { SoftBreak } from "@/components/ui/SoftBreak";
export const metadata: Metadata = {
  title: "About Us | Altivance Academic Consultancy",
  description:
    "Learn about Altivance Academic Consultancy — Nigeria's premier academic consultancy with 7+ years of excellence, 5,000+ satisfied clients, and a team of expert consultants.",
};

const values = [
  {
    icon: Star,
    title: "Academic Excellence",
    desc: "We hold every piece of work to the highest academic standards, ensuring quality that earns top grades.",
  },
  {
    icon: Award,
    title: "Integrity First",
    desc: "Transparency, honesty, and ethical practice are at the core of everything we do.",
  },
  {
    icon: Users,
    title: "Client-Centered",
    desc: "Your success is our success. We are relentlessly focused on delivering outcomes that exceed expectations.",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    desc: "We combine local expertise with international academic standards to prepare you for global success.",
  },
];

const team = [
  {
    name: "Dr. Chukwuemeka Obi",
    role: "Founder & Chief Academic Officer",
    education: "PhD, University of Lagos",
    specialization: "Research Methodology & Academic Writing",
    initials: "CO",
  },
  {
    name: "Prof. Amaka Nwosu",
    role: "Head of Research",
    education: "PhD, Covenant University",
    specialization: "Data Analysis & Statistics",
    initials: "AN",
  },
  {
    name: "Dr. Yusuf Abdullahi",
    role: "Study Abroad Director",
    education: "MSc, University of Oxford",
    specialization: "International Admissions & Scholarships",
    initials: "YA",
  },
  {
    name: "Ngozi Eze-Williams",
    role: "Head of Editorial Services",
    education: "MA English, University of Ibadan",
    specialization: "Academic Editing & Proofreading",
    initials: "NE",
  },
  {
    name: "Tunde Adeyemi",
    role: "Business Proposals Specialist",
    education: "MBA, Lagos Business School",
    specialization: "Business Writing & Proposals",
    initials: "TA",
  },
  {
    name: "Dr. Fatima Bello",
    role: "STEM Research Consultant",
    education: "PhD, Ahmadu Bello University",
    specialization: "SPSS, R, and Scientific Research",
    initials: "FB",
  },
];

const milestones = [
  { year: "2017", event: "Altivance Academic Consultancy founded", desc: "Started as a one-person operation helping final-year students." },
  { year: "2019", event: "Expanded to Study Abroad Services", desc: "Launched our study abroad division after high demand from international aspirants." },
  { year: "2021", event: "1,000+ clients milestone", desc: "Crossed the 1,000 satisfied clients mark across 12 Nigerian universities." },
  { year: "2022", event: "SPSS & Data Analysis launch", desc: "Introduced advanced statistical analysis services to support PhD students." },
  { year: "2023", event: "5,000+ students served", desc: "Expanded to serve students from 50+ universities including international clients." },
  { year: "2024", event: "Digital platform launch", desc: "Launched our full digital platform for seamless online consultations and payments." },
];

export default function AboutPage() {
  return (
    <>
      <div>
        {/* Hero */}
        {/* `accent-gold-fixed`: this band is a darkened photograph, so the accent
            is pinned to gold in BOTH themes — matching the home hero and
            `PageHero`. Red on a photographic ground does not blend (and #630303
            measures 1.27:1 on `surface-dark` outright); gold is the half of the
            palette built for dark grounds. Red on the white page body below is
            untouched. See globals.css. */}
        <section className="accent-gold-fixed pt-28 lg:pt-40 pb-20 lg:pb-28 bg-surface-dark relative overflow-hidden">
        <BackdropImage src="/images/graduates-group.jpg" blurDataURL={blur["graduates-group"]} tone="dark" parallax={0.08} priority />
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400 mb-10">
              <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white">About</span>
            </nav>

            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
                <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Our Story</span>
              </div>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black font-display text-white leading-tight mb-6">
                <TextReveal text="Where passion for" />
                <SoftBreak />
                <TextReveal
                  text="education meets expertise."
                  delay={0.12}
                  mode="line"
                  className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
                />
              </h1>
              <Reveal choreography="rise" delay={0.15}>
                <p className="text-lg text-ink-300 leading-relaxed max-w-2xl mb-10 text-pretty">
                  Founded in 2017, Altivance Academic Consultancy was born from a simple but powerful
                  belief: every student deserves access to expert guidance that helps them achieve
                  their full academic potential, regardless of their background.
                </p>
              </Reveal>
              <Reveal choreography="rise" delay={0.22}>
                <div className="flex flex-wrap gap-4">
                  <Tactile
                    href="/book"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl shadow-layered-brand overflow-hidden"
                  >
                    Book Consultation <ArrowRight className="w-4 h-4" />
                  </Tactile>
                  <Tactile
                    href="/services"
                    rippleColor="rgba(99,3,3,0.16)"
                    className="flex items-center gap-2 px-6 py-3 border border-ink-200 text-ink-300 font-semibold text-sm rounded-xl overflow-hidden transition-colors hover:border-brand-500/30 hover:bg-brand-100/20"
                  >
                    Our Services
                  </Tactile>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Mission section */}
        <section className="py-20 bg-surface">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
                  <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Our Mission</span>
                </div>
                <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-black font-display text-ink-950 leading-tight mb-6">
                  Empowering every student
                  <SoftBreak />to reach their altivance.
                </h2>
                <p className="text-ink-600 leading-relaxed mb-6">
                  We exist to democratize academic excellence. Too many brilliant students fail
                  not because of a lack of intelligence, but because of a lack of guidance,
                  resources, or support. Altivance fills that gap.
                </p>
                <p className="text-ink-600 leading-relaxed mb-8">
                  From a student in Kogi State writing their first undergraduate project to a
                  PhD candidate at the University of Lagos navigating complex statistical
                  analysis — we are here for every step of the academic journey.
                </p>
                <div className="space-y-3">
                  {[
                    "Expert team with PhDs and Masters from top universities",
                    "Personalized approach — no one-size-fits-all solutions",
                    "Complete confidentiality and academic integrity",
                    "Affordable pricing with flexible payment options",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-ink-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - visual */}
              <div className="relative">
                <div className="bg-surface rounded-3xl p-8 lg:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-100 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                      Our Vision
                    </div>
                    <p className="text-ink-950 text-2xl font-bold font-display leading-tight mb-8">
                      &ldquo;To become Africa&apos;s most trusted academic
                      partner, producing a new generation of
                      world-class scholars and professionals.&rdquo;
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "5,000+", label: "Clients" },
                        { value: "98%", label: "Success Rate" },
                        { value: "50+", label: "Universities" },
                        { value: "7+", label: "Years" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-ink-50 rounded-xl p-4">
                          <div className="text-2xl font-black text-brand-500 font-display">
                            {stat.value}
                          </div>
                          <div className="text-xs text-ink-600 mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-canvas">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
                <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Core Values</span>
                <div className="w-8 h-px bg-gradient-to-l from-brand-500 to-transparent" />
              </div>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-black font-display text-ink-950 leading-tight">
                The principles that guide us.
              </h2>
            </div>
            {/* `fold` gives this grid its own identity against the rises and
                slides used elsewhere on the page. */}
            <Stagger each={stagger.base} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((value) => (
                <StaggerItem key={value.title} choreography="fold" className="h-full">
                  <div className="h-full bg-surface border border-ink-200/60 rounded-2xl p-7 transition-[border-color,box-shadow] duration-300 hover:border-brand-500/30 hover:shadow-layered group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-5 transition-colors duration-300 group-hover:from-brand-400 group-hover:to-brand-500">
                      <value.icon className="w-5.5 h-5.5 text-brand-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-bold text-ink-950 mb-2 font-display">{value.title}</h3>
                    <p className="text-sm text-ink-600 leading-relaxed text-pretty">{value.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-surface">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mb-14">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
                <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Our Journey</span>
              </div>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-black font-display text-ink-950 leading-tight">
                Seven years of building
                <SoftBreak />academic excellence.
              </h2>
            </div>
            <div className="relative">
              <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/30 via-brand-500/20 to-transparent" />
              <div className="space-y-10">
                {milestones.map((milestone, i) => (
                  <div
                    key={milestone.year}
                    className={`relative flex gap-8 lg:gap-0 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                  >
                    {/* Year bubble — pops in ahead of its card so the eye is
                        already on the timeline when the content arrives. */}
                    <Reveal
                      choreography="scale"
                      className="absolute left-0 lg:left-1/2 -translate-y-0 lg:-translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center shadow-md z-10"
                    >
                      <span className="w-2 h-2 bg-surface rounded-full" />
                    </Reveal>

                    {/* Content — each card enters from its own side of the
                        timeline, so the alternating layout and the motion
                        reinforce each other instead of fighting. */}
                    <Reveal
                      choreography={i % 2 === 0 ? "slideRight" : "slideLeft"}
                      delay={0.08}
                      className={`pl-14 lg:pl-0 lg:w-1/2 ${i % 2 === 0 ? "lg:pr-16" : "lg:pl-16"}`}
                    >
                      <div className="bg-canvas border border-ink-200/60 rounded-2xl p-6 transition-[border-color,box-shadow] hover:border-brand-500/30 hover:shadow-layered">
                        <div className="text-brand-500 text-xs font-black tracking-wider mb-2">{milestone.year}</div>
                        <h3 className="font-bold text-ink-950 font-display mb-1">{milestone.event}</h3>
                        <p className="text-sm text-ink-600 text-pretty">{milestone.desc}</p>
                      </div>
                    </Reveal>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="py-20 bg-canvas">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
                <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Our Team</span>
                <div className="w-8 h-px bg-gradient-to-l from-brand-500 to-transparent" />
              </div>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-black font-display text-ink-950 leading-tight mb-4">
                Expert consultants.
                <SoftBreak />Real credentials.
              </h2>
              <p className="text-ink-600 text-sm">
                Our team includes PhDs, Masters holders, and industry specialists from top
                universities across Nigeria and abroad.
              </p>
            </div>
            <Stagger each={stagger.base} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {team.map((member) => (
                <StaggerItem key={member.name} choreography="rise" className="h-full">
                  <Tilt max={4} lift={6} className="h-full rounded-2xl">
                    <div className="h-full bg-surface border border-ink-200/60 rounded-2xl p-6 transition-[border-color,box-shadow] duration-300 hover:border-brand-500/30 hover:shadow-layered group">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-on-brand font-black text-lg font-display shadow-md">
                          {member.initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-ink-950 font-display text-sm">
                            {member.name}
                          </h3>
                          <div className="text-brand-500 text-xs font-semibold">{member.role}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-ink-500" />
                          <span className="text-xs text-ink-600">{member.education}</span>
                        </div>
                        <div className="text-xs text-ink-500 italic">{member.specialization}</div>
                      </div>
                    </div>
                  </Tilt>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-surface relative overflow-hidden">
          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-ink-950 leading-tight mb-6">
              <TextReveal text="Ready to work with" />
              <SoftBreak />
              <TextReveal text="Nigeria's best?" delay={0.12} className="text-brand-500" />
            </h2>
            <Reveal choreography="rise" delay={0.15}>
              <p className="text-ink-600 mb-10 max-w-xl mx-auto text-pretty">
                Book a free consultation today and let our expert team create a customized
                academic plan that gets you the results you deserve.
              </p>
              <Tactile
                href="/book"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-bold text-base rounded-2xl shadow-layered-brand overflow-hidden"
              >
                Book Free Consultation <ArrowRight className="w-5 h-5" />
              </Tactile>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
