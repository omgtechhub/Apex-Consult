import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { TextReveal } from "@/components/motion/TextReveal";
import { BlogExplorer, type Post } from "@/components/blog/BlogExplorer";
import { NewsletterForm } from "@/components/blog/NewsletterForm";

import { SoftBreak } from "@/components/ui/SoftBreak";
export const metadata: Metadata = {
  title: "Blog | Altivance Academic Consultancy",
  description:
    "Expert tips on academic writing, research, study abroad, scholarships, and career development from Altivance Academic Consultancy.",
};

const posts: Post[] = [
  {
    slug: "how-to-write-a-perfect-research-proposal",
    cover: "student-focus",
    title: "How to Write a Perfect Research Proposal in 2025",
    excerpt: "A step-by-step guide to crafting a compelling research proposal that gets approved by your supervisor on the first submission.",
    category: "Research",
    readTime: 8,
    date: "January 15, 2025",
    featured: true,
  },
  {
    slug: "chevening-scholarship-guide-nigerians",
    cover: "graduates-joy",
    title: "The Complete Chevening Scholarship Guide for Nigerian Students",
    excerpt: "Everything you need to know about applying for and winning the prestigious Chevening Scholarship from Nigeria.",
    category: "Scholarships",
    readTime: 12,
    date: "January 10, 2025",
    featured: true,
  },
  {
    slug: "spss-data-analysis-beginners",
    cover: "peer-review",
    title: "SPSS Data Analysis for Beginners: A Complete Guide",
    excerpt: "Demystifying SPSS for students. Learn the essential analyses needed for most academic research projects.",
    category: "Data Analysis",
    readTime: 10,
    date: "January 5, 2025",
    featured: false,
  },
  {
    slug: "statement-of-purpose-tips",
    cover: "graduates-group",
    title: "10 SOP Mistakes That Cost Students Admission (And How to Fix Them)",
    excerpt: "Our admissions expert reveals the most common Statement of Purpose errors Nigerian students make when applying abroad.",
    category: "Study Abroad",
    readTime: 7,
    date: "December 28, 2024",
    featured: false,
  },
  {
    slug: "avoid-plagiarism-academic-writing",
    cover: "library-desks",
    title: "How to Avoid Plagiarism in Your Academic Writing",
    excerpt: "A practical guide to proper citation, paraphrasing, and maintaining academic integrity in your research.",
    category: "Academic Writing",
    readTime: 6,
    date: "December 20, 2024",
    featured: false,
  },
  {
    slug: "uk-student-visa-guide",
    cover: "caps-sky",
    title: "UK Student Visa Application Guide 2025 for Nigerians",
    excerpt: "A complete, updated guide to the UK Student Visa application process — documents, biometrics, and common pitfalls.",
    category: "Study Abroad",
    readTime: 15,
    date: "December 15, 2024",
    featured: false,
  },
  {
    slug: "literature-review-guide",
    cover: "reading-room",
    title: "How to Write a Literature Review That Impresses Your Committee",
    excerpt: "Master the art of literature review writing with this comprehensive guide from structuring to critical analysis.",
    category: "Research",
    readTime: 9,
    date: "December 10, 2024",
    featured: false,
  },
  {
    slug: "academic-cv-writing",
    cover: "study-group",
    title: "Academic CV vs. Professional CV: What Nigerian Graduates Must Know",
    excerpt: "The key differences between academic and professional CVs and how to tailor yours for maximum impact.",
    category: "Career",
    readTime: 5,
    date: "December 5, 2024",
    featured: false,
  },
];

const categories = ["All", "Research", "Scholarships", "Study Abroad", "Data Analysis", "Academic Writing", "Career"];

export default function BlogPage() {
  return (
    <div className="bg-canvas min-h-screen">
      <PageHero image="library-desks">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Reveal choreography="fade" duration={0.4}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400 mb-10">
            <Link href="/" className="hover:text-brand-500 transition-colors duration-200 ease-standard">Home</Link>
            <span>/</span>
            <span className="text-white">Blog</span>
          </nav>
        </Reveal>

        {/* Header */}
        <Stagger className="max-w-2xl mb-14" each={0.09}>
          <StaggerItem choreography="blurRise">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
              <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Insights</span>
            </div>
          </StaggerItem>

          <StaggerItem choreography="fade">
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-white leading-tight mb-4 text-balance">
              Academic insights
              <SoftBreak />
              <TextReveal
                text="worth reading."
                mode="line"
                delay={0.12}
                className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
              />
            </h1>
          </StaggerItem>

          <StaggerItem choreography="blurRise" as="p" className="text-ink-300 leading-relaxed">
            Expert tips on academic writing, research methodology, study abroad, scholarships,
            and career development — written by our team of PhDs and specialists.
          </StaggerItem>
        </Stagger>
        </div>
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        {/* Filtering and the post grids are interactive, so they live in a
            client component. The page stays a server component for metadata. */}
        <BlogExplorer posts={posts} categories={categories} />

        <NewsletterForm />
      </div>
    </div>
  );
}
