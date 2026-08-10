import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, BookOpen, FileText, BarChart3, Globe, Award } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { TextReveal } from "@/components/motion/TextReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tactile } from "@/components/motion/Tactile";

export const metadata: Metadata = {
  title: "Resources | Apex Academic Consultancy",
  description:
    "Free academic resources — guides, templates, checklists, and tools from Apex Academic Consultancy.",
};

const resources = [
  {
    icon: FileText,
    title: "Research Proposal Template",
    desc: "A professionally formatted research proposal template with guidelines for each section.",
    type: "Template",
    format: "Word",
    free: true,
    href: "#",
  },
  {
    icon: BookOpen,
    title: "Academic Writing Style Guide",
    desc: "Complete reference guide for APA, MLA, Harvard, and Chicago citation styles.",
    type: "Guide",
    format: "PDF",
    free: true,
    href: "#",
  },
  {
    icon: BarChart3,
    title: "SPSS Step-by-Step Guide",
    desc: "Beginner-friendly SPSS tutorial covering descriptive stats, regression, and hypothesis testing.",
    type: "Tutorial",
    format: "PDF",
    free: true,
    href: "#",
  },
  {
    icon: Globe,
    title: "Study Abroad Application Checklist",
    desc: "A comprehensive checklist for UK, USA, Canada, and Australia university applications.",
    type: "Checklist",
    format: "PDF",
    free: true,
    href: "#",
  },
  {
    icon: Award,
    title: "Scholarship Application Masterclass",
    desc: "Insider strategies for winning competitive scholarships — Chevening, Commonwealth, Fulbright, and more.",
    type: "Masterclass",
    format: "PDF",
    free: false,
    price: "₦2,500",
    href: "#",
  },
  {
    icon: FileText,
    title: "Premium SOP Writing Guide",
    desc: "The ultimate Statement of Purpose writing guide with 15 successful SOP examples from Oxbridge admits.",
    type: "Premium Guide",
    format: "PDF",
    free: false,
    price: "₦3,500",
    href: "#",
  },
  {
    icon: BarChart3,
    title: "Thesis & Dissertation Planner",
    desc: "A 6-month planning spreadsheet to manage your dissertation from proposal to final submission.",
    type: "Template",
    format: "Excel",
    free: true,
    href: "#",
  },
  {
    icon: BookOpen,
    title: "Literature Review Framework",
    desc: "A structured framework and template for conducting and writing a systematic literature review.",
    type: "Template",
    format: "Word",
    free: true,
    href: "#",
  },
];

const tools = [
  { name: "Plagiarism Checker", desc: "Check your work before submission", href: "#", external: true },
  { name: "Citation Generator", desc: "Auto-generate APA, MLA, Harvard citations", href: "#", external: true },
  { name: "Word Count Tool", desc: "Accurately count words in your document", href: "#", external: true },
  { name: "Grammar Checker", desc: "Check grammar and writing style", href: "#", external: true },
];

export default function ResourcesPage() {
  return (
    <div className="bg-canvas min-h-screen">
      <PageHero image="study-group">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Reveal choreography="fade" duration={0.4}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400 mb-10">
            <Link href="/" className="hover:text-gold-500 transition-colors duration-200 ease-standard">Home</Link>
            <span>/</span>
            <span className="text-white">Resources</span>
          </nav>
        </Reveal>

        {/* Header */}
        <Stagger className="max-w-2xl mb-14" each={0.09}>
          <StaggerItem choreography="blurRise">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-gold-500 to-transparent" />
              <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">Resources</span>
            </div>
          </StaggerItem>

          <StaggerItem choreography="fade">
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-white leading-tight mb-4 text-balance">
              Free academic resources
              <br />
              <TextReveal
                text="to fuel your success."
                mode="line"
                delay={0.12}
                className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
              />
            </h1>
          </StaggerItem>

          <StaggerItem choreography="blurRise" as="p" className="text-ink-300 leading-relaxed">
            Download our free guides, templates, and checklists crafted by our expert team
            to help you excel academically — absolutely free.
          </StaggerItem>
        </Stagger>
        </div>
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        {/* Resources grid */}
        <Stagger
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
          each={0.05}
        >
          {resources.map((resource) => (
            <StaggerItem key={resource.title} choreography="scale">
              <div
                className={`relative h-full bg-surface border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-standard group overflow-hidden ${
                  resource.free
                    ? "border-ink-200/60 hover:border-gold-500/30"
                    : "border-gold-500/30 bg-gradient-to-br from-white to-gold-100/20"
                }`}
              >
                {!resource.free && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white text-[10px] font-bold rounded-full">
                    Premium
                  </div>
                )}
                {resource.free && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
                    Free
                  </div>
                )}

                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center mb-4 group-hover:from-gold-400 group-hover:to-gold-500 transition-all duration-300 ease-standard group-hover:scale-110">
                  <resource.icon className="w-5 h-5 text-gold-500 group-hover:text-white transition-colors duration-300" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-ink-500 bg-ink-100 px-2 py-0.5 rounded-full font-medium">
                    {resource.type}
                  </span>
                  <span className="text-[10px] text-ink-500">{resource.format}</span>
                </div>

                <h3 className="font-bold text-ink-950 text-sm mb-2 font-display leading-tight line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-xs text-ink-600 leading-relaxed mb-4 line-clamp-3">
                  {resource.desc}
                </p>

                <a
                  href={resource.href}
                  className={`flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ease-standard active:scale-[0.98] ${
                    resource.free
                      ? "bg-canvas border border-ink-200 text-ink-700 hover:bg-gradient-to-r hover:from-gold-400 hover:to-gold-500 hover:text-white hover:border-transparent"
                      : "bg-gradient-to-r from-gold-400 to-gold-500 text-white hover:shadow-md"
                  }`}
                >
                  {/* The arrow nudging down on hover is the affordance: it says
                      "this comes to you" rather than "this navigates away". */}
                  <Download className="w-3.5 h-3.5 transition-transform duration-300 ease-overshoot group-hover:translate-y-0.5" />
                  {resource.free ? "Download Free" : `Buy — ${resource.price}`}
                </a>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Tools */}
        <div className="mb-16">
          <Reveal choreography="rise">
            <h2 className="text-xl font-black font-display text-ink-950 mb-6">
              Useful Academic Tools
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4" each={0.06}>
            {tools.map((tool) => (
              <StaggerItem key={tool.name} choreography="slideRight">
                <a
                  href={tool.href}
                  className="block h-full bg-surface border border-ink-200/60 rounded-2xl p-5 hover:border-gold-500/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-standard group"
                  target={tool.external ? "_blank" : undefined}
                  rel={tool.external ? "noopener noreferrer" : undefined}
                >
                  <div className="font-semibold text-sm text-ink-950 mb-1 group-hover:text-gold-500 transition-colors duration-200 ease-standard">
                    {tool.name}
                  </div>
                  <div className="text-xs text-ink-500">{tool.desc}</div>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* CTA */}
        <Reveal choreography="scale">
          <div className="bg-surface rounded-3xl p-8 lg:p-12 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-100 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-2xl font-black font-display text-ink-950 mb-3 text-balance">
                Need personalized help?
              </h2>
              <p className="text-ink-600 mb-6 max-w-xl mx-auto text-sm">
                Resources are great, but sometimes you need an expert. Book a consultation
                and get tailored guidance for your specific academic challenge.
              </p>
              <Magnetic strength={0.25} contentStrength={0.4} className="inline-block">
                <Tactile
                  href="/book"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-ink-950 font-semibold text-sm rounded-xl shadow-layered-gold"
                >
                  Book Free Consultation
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-standard group-hover:translate-x-1" />
                </Tactile>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
