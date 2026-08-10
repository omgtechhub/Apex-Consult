import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { TextReveal } from "@/components/motion/TextReveal";
import { Tactile } from "@/components/motion/Tactile";
import { stagger } from "@/lib/motion";

interface Props {
  params: Promise<{ slug: string }>;
}

const serviceData: Record<string, { title: string; shortDesc: string; fullDesc: string; features: string[]; price: string; process: string[] }> = {
  "project-writing": {
    title: "Project Writing",
    shortDesc: "Complete academic projects crafted to perfection",
    fullDesc: "Our project writing service covers undergraduate, postgraduate, and doctoral projects across all disciplines. Our expert writers hold advanced degrees and have deep knowledge of academic conventions, research methodology, and subject-specific content.",
    features: [
      "100% original, custom-written content",
      "Proper referencing (APA, MLA, Harvard, Chicago)",
      "Chapter-by-chapter development with your input",
      "Well-structured abstract, introduction, literature review, methodology, findings, and conclusion",
      "Plagiarism-free with Turnitin report available",
      "Unlimited revisions until satisfied",
      "Delivery in Word and PDF format",
    ],
    price: "From ₦15,000",
    process: ["Initial consultation & briefing", "Research & outline creation", "Chapter-by-chapter writing", "Review & feedback", "Final polish & delivery"],
  },
  "proofreading": {
    title: "Project Editing & Proofreading",
    shortDesc: "Polish your work to publication standard",
    fullDesc: "Transform your draft into a polished, submission-ready masterpiece. Our expert editors correct grammar, improve academic tone, restructure weak sections, ensure citation accuracy, and format to your institution's exact guidelines.",
    features: [
      "Grammar, spelling, and punctuation correction",
      "Academic tone and style enhancement",
      "Structural improvements and flow optimization",
      "Citation and reference verification",
      "Formatting to university guidelines",
      "Plagiarism reduction suggestions",
      "Track changes version for your review",
    ],
    price: "From ₦8,000",
    process: ["Submit your document", "Expert editor assigned", "Editing completed", "Review track changes", "Final clean version delivered"],
  },
  "research-assistance": {
    title: "Research Assistance",
    shortDesc: "Comprehensive research support at every stage",
    fullDesc: "From topic selection to data collection and analysis, our research experts provide comprehensive support throughout your entire research journey. Whether you need help designing your study, conducting literature reviews, or analyzing your results.",
    features: [
      "Research topic development and refinement",
      "Systematic and narrative literature reviews",
      "Research design and methodology guidance",
      "Data collection instrument design",
      "Theoretical framework development",
      "Research proposal writing",
      "Results interpretation and discussion",
    ],
    price: "From ₦20,000",
    process: ["Briefing & scope definition", "Literature review", "Methodology design", "Data guidance", "Results & analysis"],
  },
  "data-analysis": {
    title: "Data Analysis (SPSS, R, Python)",
    shortDesc: "Statistical analysis that speaks volumes",
    fullDesc: "Our statistical analysis experts handle everything from descriptive statistics to advanced multivariate analyses using SPSS, R, STATA, and Python. We deliver clear, well-presented results with expert interpretation.",
    features: [
      "Descriptive and inferential statistics",
      "Regression analysis (simple, multiple, logistic)",
      "ANOVA, t-tests, chi-square tests",
      "Factor analysis and reliability testing",
      "Correlation and non-parametric tests",
      "Data visualization (charts, graphs, tables)",
      "Results interpretation and discussion writing",
    ],
    price: "From ₦12,000",
    process: ["Data review & cleaning", "Analysis plan", "Statistical tests run", "Visualization created", "Interpretation written"],
  },
  "cv-sop": {
    title: "CV, SOP & Recommendation Letters",
    shortDesc: "Documents that open doors",
    fullDesc: "Our professional document writing service creates compelling CVs, Statements of Purpose, and Recommendation Letters that make you stand out. Whether for university applications or job applications, we craft documents that tell your unique story.",
    features: [
      "ATS-optimized, professionally designed CV",
      "Tailored Statement of Purpose for each program",
      "Academic and professional versions available",
      "Compelling personal narrative development",
      "Multiple revision rounds included",
      "Recommendation letter templates and guidance",
      "LinkedIn profile optimization",
    ],
    price: "From ₦10,000",
    process: ["Detailed intake form", "Draft creation", "Review & feedback", "Revisions", "Final document delivery"],
  },
  "admission": {
    title: "Admission Guidance",
    shortDesc: "Navigate university applications with confidence",
    fullDesc: "Our admission guidance service provides strategic support for undergraduate, postgraduate, and doctoral university applications. We help you choose the right programs, craft compelling applications, and navigate complex admission processes.",
    features: [
      "University and program shortlisting",
      "Application strategy development",
      "Personal statement / SOP writing",
      "Application review and submission support",
      "Interview preparation coaching",
      "Offer evaluation and comparison",
      "Enrollment and next steps guidance",
    ],
    price: "From ₦25,000",
    process: ["Profile assessment", "University shortlisting", "Application preparation", "Review & submission", "Offer support"],
  },
  "scholarship": {
    title: "Scholarship Guidance",
    shortDesc: "Win the funding you deserve",
    fullDesc: "Our scholarship experts help you identify, apply for, and win competitive scholarships at local and international levels. We've helped students win Chevening, Commonwealth, Fulbright, and countless other prestigious scholarships.",
    features: [
      "Scholarship identification and matching",
      "Application strategy and planning",
      "Scholarship essay writing support",
      "Application review and optimization",
      "Recommendation letter guidance",
      "Interview preparation",
      "Portfolio development",
    ],
    price: "From ₦30,000",
    process: ["Profile analysis", "Scholarship matching", "Essay development", "Application review", "Submission & follow-up"],
  },
  "business-proposals": {
    title: "Business Proposals",
    shortDesc: "Compelling proposals that win contracts",
    fullDesc: "Our business writing experts craft professional, persuasive business proposals that win clients, contracts, and funding. We combine strategic thinking with compelling writing to help your business succeed.",
    features: [
      "Executive summary and overview",
      "Company profile and credentials",
      "Problem statement and proposed solution",
      "Methodology and implementation plan",
      "Financial projections and ROI",
      "Team qualifications and expertise",
      "Visual design and presentation",
    ],
    price: "From ₦20,000",
    process: ["Business briefing", "Proposal outline", "Content writing", "Review & refinement", "Final delivery"],
  },
  "journal-formatting": {
    title: "Journal Formatting & Publication",
    shortDesc: "Get published in top journals",
    fullDesc: "Our journal publication experts help you format your research paper to exact journal specifications and navigate the submission and peer review process. We've helped researchers get published in Q1 and Q2 journals.",
    features: [
      "Formatting to specific journal guidelines",
      "Abstract and keyword optimization",
      "Figure and table formatting",
      "Cover letter writing",
      "Journal selection guidance",
      "Response to reviewer comments",
      "Resubmission support",
    ],
    price: "From ₦15,000",
    process: ["Paper review", "Journal selection", "Formatting & editing", "Submission preparation", "Peer review support"],
  },
  "assignments": {
    title: "Assignment Assistance",
    shortDesc: "Expert help for every assignment",
    fullDesc: "Our assignment assistance service covers individual and group assignments across all subjects and academic levels. We deliver original, well-researched assignments that meet your institution's requirements.",
    features: [
      "All subjects and disciplines covered",
      "Quick turnaround (24-72 hours)",
      "100% original and plagiarism-free",
      "Proper referencing and formatting",
      "Individual and group assignments",
      "MCQ, essay, case study formats",
      "Revisions until satisfied",
    ],
    price: "From ₦5,000",
    process: ["Assignment briefing", "Expert assignment", "Research & writing", "Quality check", "Delivery"],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceData[slug];
  return {
    title: service ? `${service.title} | Apex Academic Consultancy` : "Service | Apex Academic Consultancy",
    description: service?.shortDesc || "Expert academic service from Apex Academic Consultancy.",
  };
}

export async function generateStaticParams() {
  return Object.keys(serviceData).map((slug) => ({ slug }));
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = serviceData[slug] || serviceData["project-writing"];

  return (
    <div className="bg-canvas min-h-screen">
      {/* Service detail puts its <h1> inside the two-column grid, so this hero
          stays compact: photographic band plus breadcrumb, then the page. */}
      <PageHero image="study-group" className="pb-8 lg:pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400">
            <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-gold-500 transition-colors">Services</Link>
            <span>/</span>
            <span className="text-white">{service.title}</span>
          </nav>
        </div>
      </PageHero>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-gradient-to-r from-gold-500 to-transparent" />
                <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">Service</span>
              </div>
              <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-ink-950 leading-tight mb-4">
                <TextReveal text={service.title} mode="line" />
              </h1>
              <Reveal choreography="rise" delay={0.12}>
                <p className="text-lg text-ink-600 leading-relaxed text-pretty">{service.shortDesc}</p>
              </Reveal>
            </div>

            <Reveal choreography="rise" className="bg-surface border border-ink-200/60 rounded-2xl p-8">
              <h2 className="text-xl font-bold font-display text-ink-950 mb-4">
                About This Service
              </h2>
              <p className="text-ink-700 leading-relaxed text-pretty">{service.fullDesc}</p>
            </Reveal>

            <Reveal choreography="rise" className="bg-surface border border-ink-200/60 rounded-2xl p-8">
              <h2 className="text-xl font-bold font-display text-ink-950 mb-5">
                What&apos;s Included
              </h2>
              <Stagger as="ul" each={stagger.tight} className="space-y-3">
                {service.features.map((f) => (
                  <StaggerItem key={f} as="li" choreography="slideRight" className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-ink-700">{f}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>

            <Reveal choreography="rise" className="bg-surface border border-ink-200/60 rounded-2xl p-8">
              <h2 className="text-xl font-bold font-display text-ink-950 mb-5">
                Our Process
              </h2>
              <Stagger each={stagger.base} className="space-y-4">
                {service.process.map((step, i) => (
                  <StaggerItem key={step} choreography="slideRight" className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-ink-700 font-medium">{step}</span>
                    {i < service.process.length - 1 && (
                      <div className="hidden sm:block flex-1 h-px bg-ink-200" />
                    )}
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>

            <Link
              href="/services"
              className="flex items-center gap-2 text-sm text-ink-600 hover:text-gold-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> View All Services
            </Link>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* The sticky quote panel is the conversion point on this page, so
                it arrives as one confident surface rather than assembling. */}
            <Reveal
              choreography="scale"
              className="bg-surface rounded-2xl p-6 sticky top-28 grain"
            >
              <div className="text-gold-500 text-xs font-bold tracking-wider mb-2">STARTING FROM</div>
              <div className="text-3xl font-black text-ink-950 font-display mb-4">
                {service.price}
              </div>
              <p className="text-ink-600 text-xs mb-5">
                Custom pricing based on your specific requirements. Get a free quote today.
              </p>
              <div className="space-y-3">
                <Tactile
                  href="/book"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white text-sm font-semibold rounded-xl overflow-hidden transition-shadow hover:shadow-layered-gold"
                >
                  Book Now <ArrowRight className="w-4 h-4" />
                </Tactile>
                <Tactile
                  href="https://wa.me/2347084321204"
                  external
                  rippleColor="rgba(255,255,255,0.2)"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 text-white text-sm font-medium rounded-xl overflow-hidden transition-colors hover:bg-white/5"
                >
                  Get Custom Quote
                </Tactile>
              </div>
              <Stagger each={stagger.tight} className="mt-5 pt-5 border-t border-white/10 space-y-2">
                {["100% Original Work", "Unlimited Revisions", "On-Time Delivery", "Full Confidentiality"].map((g) => (
                  <StaggerItem key={g} choreography="slideRight" className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
                    <span className="text-xs text-ink-600">{g}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
