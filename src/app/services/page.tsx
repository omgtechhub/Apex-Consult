import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, BookOpen, Globe, BarChart3, Award, Briefcase, GraduationCap, Users, PenTool, Book, Microscope, FileSearch, CheckCircle2, Download } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Reveal } from "@/components/motion/Reveal";
import { BackdropImage } from "@/components/motion/BackdropImage";
import { blur } from "@/lib/imageBlur";
import { TextReveal } from "@/components/motion/TextReveal";
import { Tactile } from "@/components/motion/Tactile";
import { Tilt } from "@/components/motion/Tilt";
// GSAP batch rather than Framer <Stagger>: this page renders several grids down
// a long scroll, and batching keeps each row's cards arriving together.
import { BatchReveal } from "@/components/motion/BatchReveal";

import { SoftBreak } from "@/components/ui/SoftBreak";
export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore all 20+ academic services at Altivance Academic Consultancy — project writing, research, data analysis, study abroad, proofreading, and more.",
};

const serviceCategories = [
  {
    id: "academic",
    title: "Academic Writing",
    desc: "From undergraduate projects to PhD dissertations — we cover every level.",
    color: "from-amber-50 to-yellow-50",
    accent: "#630303",
    services: [
      {
        name: "Project Writing",
        desc: "Complete undergraduate, postgraduate, and doctoral projects written to the highest academic standards with proper citations, methodology, and analysis.",
        features: ["Original research & writing", "Proper referencing (APA, MLA, Chicago, Harvard)", "Chapter-by-chapter development", "Abstract & literature review", "Plagiarism-free guarantee"],
        price: "From ₦65,000",
        href: "/services/project-writing",
        icon: FileText,
        popular: true,
      },
      {
        name: "Project Editing & Proofreading",
        desc: "Transform your rough draft into a polished, submission-ready document with expert editing and proofreading.",
        features: ["Grammar & syntax correction", "Academic tone enhancement", "Structural improvements", "Citation & reference checks", "Formatting to university guidelines"],
        price: "₦1,800 / 1,000 words",
        href: "/services/proofreading",
        icon: PenTool,
      },
      {
        name: "Assignment Assistance",
        desc: "Expert help for individual and group assignments across all subjects and academic levels.",
        features: ["All subjects covered", "Quick turnaround (24-48hrs)", "Original work guaranteed", "Group & individual assignments", "MCQ & descriptive formats"],
        price: "From ₦9,000",
        href: "/services/assignments",
        icon: Book,
      },
    ],
  },
  {
    id: "research",
    title: "Research & Analysis",
    desc: "Rigorous research support and statistical analysis for serious scholars.",
    color: "from-blue-50 to-indigo-50",
    accent: "#3b82f6",
    services: [
      {
        name: "Research Assistance",
        desc: "Comprehensive research support from topic selection through literature review, research design, and data collection.",
        features: ["Topic development & proposal", "Systematic literature review", "Research design & methodology", "Data collection frameworks", "Theoretical framework development"],
        price: "From ₦35,000",
        href: "/services/research-assistance",
        icon: Microscope,
        popular: true,
      },
      {
        name: "Data Analysis (SPSS, R, Python)",
        desc: "Advanced quantitative and qualitative data analysis with clear, well-presented results and interpretation.",
        features: ["SPSS, R, STATA, Python", "Descriptive & inferential statistics", "Regression & correlation analysis", "Tables, charts & figures", "Results interpretation & discussion"],
        price: "From ₦22,000",
        href: "/services/data-analysis",
        icon: BarChart3,
      },
      {
        name: "Journal Formatting & Publication",
        desc: "Format your research paper to exact journal specifications and navigate the publication process.",
        features: ["Formatting to journal guidelines", "Abstract optimization", "Cover letter writing", "Response to reviewers", "Publication strategy guidance"],
        price: "From ₦27,000",
        href: "/services/journal-formatting",
        icon: FileSearch,
      },
    ],
  },
  {
    id: "abroad",
    title: "Study Abroad & Admissions",
    desc: "Your complete support system for international academic ambitions.",
    color: "from-green-50 to-emerald-50",
    accent: "#10b981",
    services: [
      {
        name: "Study Abroad Consultancy",
        desc: "End-to-end guidance for studying at top universities in the UK, USA, Canada, Australia, and Europe.",
        features: ["University selection strategy", "Application management", "SOP & personal statement", "Visa documentation", "Pre-departure orientation"],
        price: "From ₦190,000",
        href: "/study-abroad",
        icon: Globe,
        popular: true,
      },
      {
        name: "Admission Guidance",
        desc: "Strategic support for undergraduate, postgraduate, and doctoral university applications.",
        features: ["University shortlisting", "Application review & submission", "Interview preparation", "Offer evaluation", "Enrollment support"],
        price: "From ₦18,000",
        href: "/services/admission",
        icon: GraduationCap,
      },
      {
        name: "Scholarship Guidance",
        desc: "Identify and successfully apply for scholarships worth millions — from local to international.",
        features: ["Scholarship identification", "Essay writing support", "Application review", "Recommendation letter guidance", "Interview coaching"],
        price: "From ₦35,000",
        href: "/services/scholarship",
        icon: Award,
      },
    ],
  },
  {
    id: "professional",
    title: "Professional Documents",
    desc: "Career-defining documents written by experts who know what works.",
    color: "from-purple-50 to-violet-50",
    accent: "#8b5cf6",
    services: [
      {
        name: "CV & Resume Writing",
        desc: "ATS-optimized, professionally designed CVs that get you noticed by top employers and universities.",
        features: ["Professional CV design", "ATS optimization", "Achievement-focused writing", "Multiple format versions", "Cover letter included"],
        price: "From ₦20,000",
        href: "/services/cv-sop",
        icon: FileText,
        popular: true,
      },
      {
        name: "Statement of Purpose (SOP)",
        desc: "Compelling, authentic SOPs that tell your unique story and open doors to your dream university.",
        features: ["Tailored to specific program", "Personal narrative development", "Academic goals articulation", "Multiple revisions", "Final proofreading"],
        price: "From ₦75,000",
        href: "/services/cv-sop",
        icon: Users,
      },
      {
        name: "Business Proposals",
        desc: "Persuasive, professionally structured business proposals that win clients, contracts, and funding.",
        features: ["Executive summary", "Market analysis", "Financial projections", "Visual presentation", "Pitch deck option"],
        price: "From ₦75,000",
        href: "/services/business-proposals",
        icon: Briefcase,
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      {/* `accent-gold-fixed`: this band is a darkened photograph, so the accent
          is pinned to gold in BOTH themes — matching the home hero and
          `PageHero`. Red on a photographic ground does not blend (and #630303
          measures 1.27:1 on `surface-dark` outright); gold is the half of the
          palette built for dark grounds. Red on the white page body below is
          untouched. See globals.css. */}
      <section className="accent-gold-fixed pt-28 lg:pt-40 pb-16 lg:pb-20 bg-surface-dark relative overflow-hidden">
        <BackdropImage src="/images/peer-review.jpg" blurDataURL={blur["peer-review"]} tone="dark" parallax={0.08} priority />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400 mb-10">
            <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Services</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
              <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Our Services</span>
            </div>
            <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black font-display text-white leading-tight mb-6">
              <TextReveal text="Expert academic support" />
              <SoftBreak />
              <TextReveal
                text="for every need."
                delay={0.12}
                mode="line"
                className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
              />
            </h1>
            <Reveal choreography="rise" delay={0.15}>
              <p className="text-lg text-ink-300 leading-relaxed mb-8 text-pretty">
                From your first undergraduate project to your PhD dissertation, from study abroad
                applications to business proposals — our expert team covers every academic and
                professional need.
              </p>
            </Reveal>
            <Reveal choreography="rise" delay={0.22}>
              <div className="flex flex-wrap gap-3">
                <Tactile
                  href="/book"
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl shadow-layered-brand overflow-hidden"
                >
                  Get Custom Quote <ArrowRight className="w-4 h-4" />
                </Tactile>
                <Tactile
                  href="https://wa.me/2347084321204"
                  external
                  rippleColor="rgba(99,3,3,0.16)"
                  className="flex items-center gap-2 px-5 py-3 border border-ink-200 text-ink-300 font-semibold text-sm rounded-xl overflow-hidden transition-colors hover:border-brand-500/30"
                >
                  <WhatsAppIcon className="w-4 h-4" /> WhatsApp Us
                </Tactile>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Service categories */}
      <div className="bg-surface">
        {serviceCategories.map((category, catIdx) => (
          <section
            key={category.id}
            id={category.id}
            className={`py-20 ${catIdx % 2 === 0 ? "bg-surface" : "bg-canvas"}`}
          >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category header */}
              <Reveal choreography="rise" className="flex items-center justify-between mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
                    <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">
                      {String(catIdx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-black font-display text-ink-950 leading-tight">
                    {category.title}
                  </h2>
                  <p className="text-ink-600 text-sm mt-2">{category.desc}</p>
                </div>
              </Reveal>

              {/* Services */}
              <BatchReveal className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {category.services.map((service) => (
                  <Tilt
                    key={service.name}
                    max={service.popular ? 6 : 4}
                    lift={6}
                    className="h-full rounded-3xl"
                  >
                  {/* The batch marker sits on the card, not on <Tilt>: GSAP
                      animates opacity/y here while Tilt owns the rotation on
                      the parent, so the two never write the same transform. */}
                  <div
                    data-batch-item
                    className={`relative flex h-full flex-col bg-surface border rounded-3xl p-7 transition-[border-color,box-shadow] duration-300 group overflow-hidden ${
                      service.popular
                        ? "border-brand-500/40 shadow-layered-brand"
                        : "border-ink-200/60 hover:shadow-layered"
                    }`}
                  >
                    {service.popular && (
                      <div className="absolute top-5 right-5 px-2.5 py-1 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Most Popular
                      </div>
                    )}

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-5 transition-colors duration-300 group-hover:from-brand-400 group-hover:to-brand-500">
                      <service.icon className="w-5.5 h-5.5 text-brand-500 group-hover:text-white transition-colors duration-300" />
                    </div>

                    <h3 className="font-bold text-ink-950 text-lg mb-2 font-display">
                      {service.name}
                    </h3>
                    <p className="text-sm text-ink-600 leading-relaxed mb-5 text-pretty">{service.desc}</p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-ink-600">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price & CTA — mt-auto keeps the price row on a shared
                        baseline across cards with differing feature counts. */}
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-ink-100">
                      <div>
                        <div className="text-xs text-ink-500">Starting from</div>
                        <div className="font-bold text-ink-950 text-lg font-display">
                          {service.price}
                        </div>
                      </div>
                      <Tactile
                        href={service.href}
                        lift={1}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand text-xs font-bold rounded-xl overflow-hidden transition-shadow hover:shadow-md"
                      >
                        Get Started <ArrowRight className="w-3.5 h-3.5" />
                      </Tactile>
                    </div>

                    {/* Hover bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>
                  </Tilt>
                ))}
              </BatchReveal>
            </div>
          </section>
        ))}
      </div>

      {/* Resources CTA */}
      <section className="py-20 bg-canvas border-t border-ink-200/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal choreography="scale" className="bg-surface rounded-3xl p-10 lg:p-14 relative overflow-hidden grain">
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-4 h-4 text-brand-500" />
                  <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Free Resources</span>
                </div>
                <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-black font-display text-ink-950 mb-3">
                  Not sure where to start?
                </h2>
                <p className="text-ink-600 leading-relaxed text-pretty">
                  Download our free academic success guide or book a free 15-minute
                  consultation with one of our experts to discuss your specific needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Tactile
                  href="/resources"
                  rippleColor="rgba(255,255,255,0.2)"
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-ink-200 text-ink-950 font-semibold text-sm rounded-xl overflow-hidden transition-colors hover:bg-white/15"
                >
                  <Download className="w-4 h-4" /> Free Resources
                </Tactile>
                <Tactile
                  href="/book"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl shadow-layered-brand overflow-hidden"
                >
                  Book Free Consultation <ArrowRight className="w-4 h-4" />
                </Tactile>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
