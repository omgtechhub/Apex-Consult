import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${title} | Blog`,
    description: `Read our expert insights on ${title} from Altivance Academic Consultancy.`,
  };
}

const samplePost = {
  title: "How to Write a Perfect Research Proposal in 2025",
  category: "Research",
  readTime: 8,
  date: "January 15, 2025",
  author: "Dr. Chukwuemeka Obi",
  authorRole: "Chief Academic Officer",
  content: `
A research proposal is one of the most critical documents in your academic journey.
Whether you're applying for a PhD program, seeking funding, or beginning a research project,
a compelling proposal can make or break your chances of success.

## What is a Research Proposal?

A research proposal is a detailed plan that outlines what you intend to research, why it matters,
how you plan to conduct the research, and what you expect to find. It's your opportunity to convince
supervisors, committees, or funding bodies that your research is worth pursuing.

## The Essential Components

### 1. Title
Your title should be specific, informative, and compelling. Avoid vague titles like "A Study of Education"
and instead opt for "The Impact of Digital Learning Tools on Academic Performance Among Secondary School
Students in Lagos State."

### 2. Abstract
A concise summary (usually 200-300 words) of your entire proposal. Write this last.

### 3. Introduction and Background
Establish the context for your research. What is the problem? Why does it matter? What gap in knowledge
does your research address?

### 4. Literature Review
Demonstrate your knowledge of existing research in your field. Identify what has been done, what hasn't,
and where your research fits.

### 5. Research Objectives and Questions
Clearly state what you aim to achieve. Your objectives should be SMART: Specific, Measurable, Achievable,
Relevant, and Time-bound.

### 6. Methodology
Explain how you will conduct your research. This includes your research design, data collection methods,
sampling strategy, and data analysis approach.

### 7. Timeline
Create a realistic timeline showing how you will complete each phase of your research.

### 8. References
Ensure all sources cited follow your required referencing style (APA, MLA, Harvard, etc.).

## Common Mistakes to Avoid

- Being too vague about methodology
- Underestimating the literature review
- Setting unrealistic timelines
- Ignoring ethical considerations
- Poor referencing

## Need Help?

Our expert team at Altivance Academic Consultancy has helped hundreds of students develop successful research
proposals. Book a free consultation to discuss your specific needs.
  `,
};

export default function BlogPostPage() {
  return (
    <div className="pt-24 lg:pt-32 bg-canvas min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal choreography="fade" duration={0.4}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-500 mb-10">
            <Link href="/" className="hover:text-brand-500 transition-colors duration-200 ease-standard">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-brand-500 transition-colors duration-200 ease-standard">Blog</Link>
            <span>/</span>
            <span className="text-ink-950 truncate max-w-[200px]">{samplePost.title}</span>
          </nav>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Article */}
          <article className="lg:col-span-2">
            <Reveal choreography="rise">
              <div className="bg-surface border border-ink-200/60 rounded-3xl p-8 lg:p-12">
                <Stagger each={0.07}>
                  <StaggerItem choreography="blurRise">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">
                        {samplePost.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-ink-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{samplePost.readTime} min read</span>
                      </div>
                      <span className="text-xs text-ink-500">{samplePost.date}</span>
                    </div>
                  </StaggerItem>

                  <StaggerItem choreography="rise">
                    <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-black font-display text-ink-950 leading-tight mb-6 text-balance">
                      {samplePost.title}
                    </h1>
                  </StaggerItem>

                  <StaggerItem choreography="blurRise">
                    <div className="flex items-center gap-3 mb-8 pb-8 border-b border-ink-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-on-brand font-bold text-sm">
                        CO
                      </div>
                      <div>
                        <div className="font-semibold text-ink-950 text-sm">{samplePost.author}</div>
                        <div className="text-xs text-ink-500">{samplePost.authorRole}</div>
                      </div>
                    </div>
                  </StaggerItem>
                </Stagger>

                {/*
                  Article body is deliberately NOT animated.

                  Revealing prose paragraph-by-paragraph on scroll looks
                  impressive in a demo and is hostile in practice: the reader
                  scrolls to the text they were mid-sentence on and it isn't
                  there yet. Long-form reading is the one place on this site
                  where the correct amount of motion is none. The card it sits
                  in animates once; the words inside it never move.
                */}
                <div className="prose prose-sm lg:prose-base max-w-none text-ink-700">
                  {samplePost.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("## ")) {
                      return (
                        <h2 key={i} className="text-xl font-black font-display text-ink-950 mt-8 mb-4">
                          {para.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (para.startsWith("### ")) {
                      return (
                        <h3 key={i} className="text-base font-bold font-display text-ink-950 mt-6 mb-3">
                          {para.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (para.startsWith("- ")) {
                      return (
                        <ul key={i} className="list-disc list-inside space-y-1 my-3">
                          {para.split("\n").map((item, j) => (
                            <li key={j} className="text-sm leading-relaxed">{item.replace("- ", "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return para.trim() ? (
                      <p key={i} className="text-sm leading-relaxed my-4">{para.trim()}</p>
                    ) : null;
                  })}
                </div>

                <div className="mt-10 pt-8 border-t border-ink-100">
                  <Link
                    href="/blog"
                    className="group inline-flex items-center gap-2 text-sm text-ink-600 hover:text-brand-500 transition-colors duration-200 ease-standard"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 ease-standard group-hover:-translate-x-1" />
                    Back to Blog
                  </Link>
                </div>
              </div>
            </Reveal>
          </article>

          {/* Sidebar */}
          <Stagger as="div" className="space-y-5" each={0.1}>
            <StaggerItem choreography="slideLeft">
              <aside className="bg-surface rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-2xl" />
                <div className="relative">
                  <h3 className="font-bold text-ink-950 text-base font-display mb-2">
                    Need expert help?
                  </h3>
                  <p className="text-ink-600 text-xs mb-4 leading-relaxed">
                    Our expert consultants are ready to help with your research proposal and more.
                  </p>
                  <Link
                    href="/book"
                    className="group flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand text-xs font-semibold rounded-xl hover:shadow-layered-brand active:scale-[0.98] transition-all duration-200 ease-standard"
                  >
                    Book Free Consultation
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-standard group-hover:translate-x-1" />
                  </Link>
                </div>
              </aside>
            </StaggerItem>

            <StaggerItem choreography="slideLeft">
              <div className="bg-surface border border-ink-200/60 rounded-2xl p-6">
                <h3 className="font-bold text-ink-950 text-sm mb-4">Related Services</h3>
                <div className="space-y-2">
                  {["Research Assistance", "Project Writing", "Data Analysis"].map((s) => (
                    <Link
                      key={s}
                      href="/services"
                      className="group flex items-center gap-2 text-xs text-ink-600 hover:text-brand-500 transition-colors duration-200 ease-standard py-1.5"
                    >
                      <ArrowRight className="w-3 h-3 transition-transform duration-300 ease-standard group-hover:translate-x-0.5" />
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </div>
  );
}
