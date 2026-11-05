"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapse } from "@/components/motion/Collapse";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { spring, stagger } from "@/lib/motion";

import { SoftBreak } from "@/components/ui/SoftBreak";
const faqData = [
  {
    category: "General",
    items: [
      {
        q: "What is Altivance Academic Consultancy?",
        a: "Altivance Academic Consultancy is Nigeria's premier academic support service offering project writing, research assistance, data analysis, study abroad guidance, and more. We've served 5,000+ students and professionals since 2017.",
      },
      {
        q: "How do I get started?",
        a: "Simply book a free 15-minute consultation through our website, send a WhatsApp message to +234 708 432 1204, or fill out our contact form. We'll respond within 2 hours.",
      },
      {
        q: "What academic levels do you serve?",
        a: "We serve all academic levels — from OND/HND students to BSc, MSc, MBA, PhD candidates, as well as professional/corporate clients needing business documents.",
      },
      {
        q: "Is your service confidential?",
        a: "Absolutely. We treat every client's information with strict confidentiality. All team members sign NDAs, and we never share your personal or academic information with third parties.",
      },
    ],
  },
  {
    category: "Services & Quality",
    items: [
      {
        q: "Is the work 100% original?",
        a: "Yes. Every document is written from scratch specifically for each client. We run all work through Turnitin and Copyscape and provide plagiarism reports on request.",
      },
      {
        q: "What subjects do you cover?",
        a: "We cover virtually all disciplines including Business, Sciences, Social Sciences, Humanities, Engineering, Medicine, Law, Education, Computer Science, and more.",
      },
      {
        q: "How many revisions do I get?",
        a: "We offer unlimited revisions until you are 100% satisfied with the work. We stand behind the quality of every deliverable.",
      },
      {
        q: "Do you offer proofreading only?",
        a: "Yes! We offer standalone proofreading, editing, and formatting services. You can submit your existing work for professional polishing.",
      },
    ],
  },
  {
    category: "Turnaround & Delivery",
    items: [
      {
        q: "How fast can you complete my project?",
        a: "Turnaround depends on complexity. Proofreading: 24-48hrs. Assignments: 24-72hrs. Full projects: 5-14 days. We also offer rush services for urgent deadlines at an additional fee.",
      },
      {
        q: "Can you work with urgent deadlines?",
        a: "Yes! We offer rush delivery for urgent projects. A 24-hour rush carries an additional 50% fee. Contact us on WhatsApp for urgent requests — we respond immediately.",
      },
      {
        q: "How is the completed work delivered?",
        a: "Completed work is delivered via email and/or WhatsApp in your required format (Word, PDF, etc.). You'll receive a notification when your work is ready.",
      },
    ],
  },
  {
    category: "Pricing & Payment",
    items: [
      {
        q: "How much do your services cost?",
        a: "Pricing depends on academic level, scope and deadline. Complete projects start at ₦65,000 for undergraduate, ₦110,000 for a master's thesis and ₦290,000 for a PhD dissertation. Single components cost far less — a chapter from ₦10,000, data analysis from ₦22,000, proofreading at ₦1,800 per 1,000 words. See the pricing page for the full rate card, or book a free consultation for a written, itemised quote.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Everything goes through Paystack, our secure payment gateway — card, bank transfer, USSD and mobile money, including international cards. Direct bank transfer is available too. Standard installment terms are 50% to begin, 30% at draft delivery and 20% on final delivery.",
      },
      {
        q: "Do you offer discounts?",
        a: "Yes! We offer student discounts, referral bonuses, and package deals for returning clients. Ask about our discount programs when you book.",
      },
      {
        q: "What if I'm not satisfied?",
        a: "We offer a satisfaction guarantee with unlimited revisions. If we cannot meet your requirements after reasonable revisions, we issue a full refund.",
      },
    ],
  },
  {
    category: "Study Abroad",
    items: [
      {
        q: "Which countries do you support study abroad applications for?",
        a: "We support applications to the UK, USA, Canada, Australia, Germany, Ireland, Netherlands, France, and many more countries across Europe and beyond.",
      },
      {
        q: "Can you help with visa applications?",
        a: "Yes! We provide complete visa documentation support — from compiling required documents to preparing you for visa interviews. Our visa success rate is 98%.",
      },
      {
        q: "Do you help with scholarship applications?",
        a: "Absolutely. We help you identify suitable scholarships and guide you through the entire application process including essays, recommendation letters, and interviews.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const prefersReduced = useReducedMotion() ?? false;

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = ["All", ...faqData.map((c) => c.category)];

  const filtered = faqData
    .filter((cat) => activeCategory === "All" || cat.category === activeCategory)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          search === "" ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="bg-canvas min-h-screen">
      <PageHero image="reading-room" position="object-[center_35%]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400 mb-10">
          <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white">FAQ</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
            <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">FAQ</span>
            <div className="w-8 h-px bg-gradient-to-l from-brand-500 to-transparent" />
          </div>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-white leading-tight mb-4">
            Frequently Asked
            <SoftBreak />
            {/* Token gradient, not an inline hex triple.
                The hardcoded `#b30f0f -> #630303 -> #3d0202` that used to live
                here could not follow the theme or this band's gold pin, so it
                stayed red on the photograph while every other hero headline on
                the site went gold. Utilities compile to `var(--color-brand-*)`,
                which `.accent-gold-fixed` re-points — so this now matches the
                other heroes by construction instead of by hand. */}
            <span className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-ink-600">
            Find answers to the most common questions about our services, pricing, and process.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-surface border border-ink-200 rounded-2xl text-sm text-ink-950 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all"
            />
          </div>
        </div>

        {/* Category filter — one shared pill slides between tabs, matching the
            services grid on the homepage so the two read as the same control. */}
        <Stagger
          each={stagger.tight}
          className="flex flex-wrap gap-2 justify-center mb-12"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <StaggerItem key={cat} choreography="scale">
                <motion.button
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isActive}
                  whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                  transition={spring.snappy}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                    // `text-on-brand`, not `text-white`: the pill behind this
                    // label is a brand fill, and in this band the brand fill is
                    // gold. White on #fcc623 is 1.6:1 — the label would be
                    // unreadable. `on-brand` is the token that tracks the fill
                    // (white on red, near-black on gold), which is exactly the
                    // job it exists for.
                    isActive
                      ? "text-on-brand"
                      : "bg-surface border border-ink-200 text-ink-600 hover:border-brand-500/30"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="faq-filter-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 shadow-md"
                      transition={spring.snappy}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </motion.button>
              </StaggerItem>
            );
          })}
        </Stagger>
        </div>
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto space-y-8">
          {filtered.map((category) => (
            <Reveal key={category.category} choreography="rise">
              <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-brand-500 mb-4">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.items.map((item, i) => {
                  const key = `${category.category}-${i}`;
                  const isOpen = openItems[key];
                  return (
                    <div
                      key={key}
                      className={cn(
                        "bg-surface border rounded-2xl transition-colors duration-300",
                        isOpen
                          ? "border-brand-500/30 shadow-[0_4px_24px_rgba(99,3,3,0.08)]"
                          : "border-ink-200/60 hover:border-brand-500/20"
                      )}
                    >
                      <h3>
                        <button
                          id={`faq-trigger-${key}`}
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${key}`}
                        >
                          <span
                            className={cn(
                              "font-semibold text-sm leading-relaxed transition-colors",
                              isOpen ? "text-brand-500" : "text-ink-950"
                            )}
                          >
                            {item.q}
                          </span>
                          <motion.span
                            className="flex-shrink-0"
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={prefersReduced ? { duration: 0 } : spring.snappy}
                          >
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-colors",
                                isOpen ? "text-brand-500" : "text-ink-500"
                              )}
                            />
                          </motion.span>
                        </button>
                      </h3>

                      {/* Was `max-h-96`, which silently clipped any answer over
                          24rem and eased against the cap rather than the real
                          content — so every panel closed faster than it opened.
                          <Collapse> measures the actual height. */}
                      <Collapse
                        open={isOpen}
                        id={`faq-panel-${key}`}
                        labelledBy={`faq-trigger-${key}`}
                      >
                        <div className="px-6 pb-5 text-sm text-ink-600 leading-relaxed border-t border-ink-100 pt-4 text-pretty">
                          {item.a}
                        </div>
                      </Collapse>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Still have questions */}
        <Reveal
          choreography="scale"
          className="max-w-3xl mx-auto mt-16 bg-surface rounded-3xl p-8 lg:p-10 relative overflow-hidden text-center grain"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-100 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="text-2xl font-black font-display text-ink-950 mb-3">
              Still have questions?
            </h2>
            <p className="text-ink-600 mb-6">
              Our team is ready to help. Reach out via WhatsApp or book a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/2347084321204"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#25D366] text-ink-950 font-semibold text-sm rounded-xl"
              >
                Chat on WhatsApp
              </a>
              <Link
                href="/book"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl"
              >
                Book Free Consultation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
