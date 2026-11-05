import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Zap } from "lucide-react";
// Client boundaries inside a server component: only these wrappers ship JS,
// while the plan markup itself stays server-rendered.
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BackdropImage } from "@/components/motion/BackdropImage";
import { blur } from "@/lib/imageBlur";
import { TextReveal } from "@/components/motion/TextReveal";
import { Tilt } from "@/components/motion/Tilt";
import { Tactile } from "@/components/motion/Tactile";
import { stagger } from "@/lib/motion";

import { SoftBreak } from "@/components/ui/SoftBreak";
export const metadata: Metadata = {
  title: "Pricing | Altivance Academic Consultancy",
  description:
    "Undergraduate projects from ₦65,000, master’s theses from ₦110,000, PhD dissertations from ₦290,000. Per-component rates for analysis, editing and admissions. No hidden fees.",
};

/**
 * Rate card — benchmarked against published Nigerian competitor pricing,
 * October 2026.
 * ----------------------------------------------------------------------------
 * STRUCTURE follows the market rather than a generic SaaS tier ladder. Of four
 * Nigerian providers surveyed, three price by academic level (undergraduate /
 * master's / PhD) with an à-la-carte rate card beneath, and none bundles
 * unrelated services into Starter/Professional/Premium steps. The old ladder
 * also made an unbounded promise — "full project writing (any length)" for a
 * flat ₦20,000 — and asked a proofreading customer and a PhD candidate to
 * read the same box. Level-based pricing removes both problems.
 *
 * POSITIONING is the mid-market band, undercut by a deliberately small
 * ABSOLUTE margin rather than a percentage: at most ₦10,000 below the
 * benchmark on the large packages, and proportionally less further down the
 * card (₦5,000 on mid-size items, ₦100–3,000 on per-chapter and per-1,000-word
 * rates, where ₦5,000 off would be a third of the price). The point is to read
 * as the cheaper option on a like-for-like comparison, not to undercut the
 * market so far that the work looks suspect — every competitor surveyed warns
 * its readers against prices that seem too good to be true.
 *
 * Nigerian pricing is bimodal, so "the market rate" is not a single number:
 *
 *   mass    finalproject.ng    complete undergrad project ₦15k / ₦25k / ₦35k,
 *                              differentiated only by turnaround
 *   mid     writers.ng (Lagos) undergrad ₦45–75k · master's ₦120–350k ·
 *                              PhD ₦300–800k · analysis only ₦25–75k
 *   premium writers.ng (guide) undergrad ₦150–450k · master's ₦600k–1.5M ·
 *                              PhD ₦2M–4.5M
 *
 * The premium figures are treated as unreliable: the same site quotes both
 * ₦150–350k and ₦45–75k for a complete undergraduate project.
 *
 * Undergraduate sits at ₦65,000 by business decision — inside the mid-market
 * band but near its top rather than under it.
 *
 * Unbenchmarked lines, set by scaling from neighbours because no surveyed
 * competitor publishes them: academic CV, defence slide deck.
 */
const plans = [
  {
    name: "Undergraduate",
    tagline: "B.Sc, B.A, HND",
    price: "From ₦65,000",
    period: "complete project",
    desc: "Final-year project from topic approval through to defence — all five chapters, with analysis included.",
    features: [
      "Chapters 1–5, abstract, appendices",
      "Topic approval & proposal support",
      "Questionnaire / instrument design",
      "SPSS or Excel analysis included",
      "Full APA / MLA referencing",
      "Unlimited revisions",
      "4–6 week delivery",
    ],
    cta: "Get Started",
    href: "/book",
  },
  {
    name: "Master's",
    tagline: "MSc, MBA, MEd, MPH",
    price: "From ₦110,000",
    period: "complete thesis",
    desc: "Proposal through to defence, with the full statistical treatment your committee will expect.",
    features: [
      "Complete thesis, every chapter",
      "Research proposal & ethics documents",
      "Literature review, 80+ sources",
      "Quantitative, qualitative or mixed methods",
      "SPSS, R, Python or NVivo",
      "Unlimited revisions",
      "Defence preparation session",
      "8–12 week delivery",
    ],
    cta: "Book Now",
    href: "/book",
  },
  {
    name: "PhD",
    tagline: "Doctoral research",
    price: "From ₦290,000",
    period: "complete dissertation",
    desc: "End-to-end doctoral support, including turning your findings into publication-ready output.",
    features: [
      "Complete dissertation",
      "Proposal & comprehensive literature review",
      "Advanced modelling (SEM, HLM, factor analysis)",
      "Journal article preparation",
      "Dedicated PhD-holding consultant",
      "Unlimited revisions",
      "Defence coaching",
      "6 months post-submission support",
    ],
    cta: "Book Consultation",
    href: "/book",
  },
];

/**
 * À-la-carte rates, for the large share of enquiries that want one component
 * rather than a whole project. Grouping them is what lets a visitor who only
 * needs SPSS output find a number without reading three package boxes first.
 */
const rateCard = [
  {
    group: "Writing by component",
    note: "When you need part of a project rather than the whole of it.",
    items: [
      { name: "Single chapter — undergraduate", price: "From ₦10,000" },
      { name: "Single chapter — master's", price: "From ₦22,000" },
      { name: "Single chapter — PhD", price: "From ₦40,000" },
      { name: "Research proposal — master's", price: "From ₦35,000" },
      { name: "Research proposal — PhD", price: "From ₦75,000" },
      { name: "Standalone literature review", price: "From ₦90,000" },
    ],
  },
  {
    group: "Data & analysis",
    note: "Already collected your data? We analyse and interpret it.",
    items: [
      { name: "Quantitative (SPSS, R, Python)", price: "From ₦22,000" },
      { name: "Qualitative (NVivo, thematic)", price: "From ₦27,000" },
      { name: "Mixed methods", price: "From ₦40,000" },
      { name: "Advanced modelling / PhD level", price: "From ₦70,000" },
    ],
  },
  {
    group: "Editing & proofreading",
    note: "Priced per 1,000 words, the way professional editors quote.",
    items: [
      { name: "Proofreading", price: "₦1,800 / 1,000 words" },
      { name: "Copy editing", price: "₦3,800 / 1,000 words" },
      { name: "Substantive editing", price: "₦6,500 / 1,000 words" },
      { name: "Full thesis edit", price: "From ₦70,000" },
    ],
  },
  {
    group: "Admissions & study abroad",
    note: "Consultation first — we will tell you if you do not need the full package.",
    items: [
      { name: "Consultation session", price: "From ₦18,000" },
      { name: "Personal statement", price: "From ₦45,000" },
      { name: "Statement of purpose (postgraduate)", price: "From ₦75,000" },
      { name: "Scholarship essay", price: "From ₦35,000" },
      { name: "Academic CV", price: "From ₦20,000" },
      { name: "Full application package", price: "From ₦190,000" },
    ],
  },
  {
    group: "Publication & extras",
    note: "",
    items: [
      { name: "Journal article preparation", price: "From ₦90,000" },
      { name: "Journal submission & formatting", price: "From ₦27,000" },
      { name: "Defence preparation & coaching", price: "From ₦25,000" },
      { name: "Defence slide deck", price: "From ₦12,000" },
      { name: "Rush delivery — 7 days", price: "+35%" },
      { name: "Rush delivery — 72 hours", price: "+70%" },
    ],
  },
];

/**
 * Every provider surveyed bundles these, so billing for them reads as
 * nickel-and-diming rather than as transparency. The previous add-on grid sold
 * the Turnitin report at ₦3,000, a plagiarism report at ₦2,000 and each extra
 * revision round at ₦3,000; all three are now included.
 */
const included = [
  "Turnitin / plagiarism report",
  "Unlimited revisions within the agreed scope",
  "Referencing in your required style",
  "University formatting compliance",
  "Revisions from supervisor feedback",
  "WhatsApp support throughout",
];

const faq = [
  {
    q: "How do you arrive at a price?",
    a: "Three things: academic level, scope, and deadline. The figures here are starting prices on a standard timeline — a longer project, primary data collection, or a tight deadline moves the number. Book a free consultation and you get a written, itemised quote before you pay anything.",
  },
  {
    q: "Do you offer payment installments?",
    a: "Yes. Standard terms are 50% to begin, 30% at draft delivery, and 20% on final delivery. Larger dissertations can be split across four stages, or paid chapter by chapter.",
  },
  {
    q: "Is there a discount for booking early?",
    a: "Yes — 10% off when you start three or more months before your deadline, and 15% off your first complete project. An early booking also buys a calmer timeline, which produces better work than any rush ever does.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Card, bank transfer, USSD and mobile money — all through Paystack, our secure payment gateway, which also accepts international cards. Direct bank transfer is available for larger payments. Once your written quote is agreed, you can pay online from the payments page.",
  },
  {
    q: "What if I'm not satisfied with the work?",
    a: "Revisions are unlimited within the agreed scope, and we keep going until the work meets your supervisor's requirements. If we cannot deliver what was agreed, you get a full refund.",
  },
  {
    q: "Why are your rates below the larger agencies?",
    a: "Lower overheads, not lower standards. We are a lean team of specialist consultants rather than a brokerage marking up subcontracted writers, so our rates sit below the going mid-market rate for comparable work.",
  },
];

export default function PricingPage() {
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
        <BackdropImage src="/images/library-desks.jpg" blurDataURL={blur["library-desks"]} tone="dark" parallax={0.08} priority />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-ink-400 mb-10">
            <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Pricing</span>
          </nav>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
            <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Pricing</span>
            <div className="w-8 h-px bg-gradient-to-l from-brand-500 to-transparent" />
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black font-display text-white leading-tight mb-5">
            <TextReveal text="Transparent pricing." />
            <SoftBreak />
            <TextReveal
              text="No hidden fees. Ever."
              delay={0.12}
              mode="line"
              className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
            />
          </h1>
          <Reveal choreography="rise" delay={0.15}>
            <p className="text-lg text-ink-600 max-w-xl mx-auto mb-8 text-pretty">
              Priced by academic level, with every component available on its own.
              Unlimited revisions and full confidentiality on every order.
            </p>
          </Reveal>
          <Reveal choreography="scale" delay={0.22}>
            {/* `glass-dark`, not `glass`.
                This chip sits inside the dark photographic hero, so a *light*
                glass panel here was already inverted: `.bg-surface-dark` lifts
                `ink-600` to #a8b2bb for use on dark, and this chip was putting
                that pale grey onto a 72%-white panel — around 1.9:1, i.e.
                illegible in light mode before any of this. Matching the home
                hero's chips (`glass-dark` + `ink-300`) fixes that and keeps the
                gold accent on a ground it can actually sit on. */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-xs font-medium text-ink-300">
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              Free consultation — written, itemised quote before you pay
            </div>
          </Reveal>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* No featured card, by design.
              ------------------------------------------------------------------
              The three tiers are academic levels, not a good/better/best
              ladder — an undergraduate is not weighing up the PhD column, so
              there is nothing to recommend. The previous version scaled the
              middle card, gave it brand chrome and crowned it "Recommended",
              which implied a choice the visitor does not actually have.

              So: one `rise` for all three, identical chrome, identical CTA
              weight. Every per-plan ternary that used to live here is gone
              rather than left switched off — and several were already dead,
              resolving to the same class on both branches. */}
          <Stagger
            each={stagger.loose}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {plans.map((plan) => (
              <StaggerItem key={plan.name} choreography="rise" className="h-full">
                <Tilt max={4} lift={6} className="h-full rounded-3xl">
                  <div className="relative flex h-full flex-col rounded-3xl bg-canvas border border-ink-200/60 p-8 transition-[border-color,box-shadow] duration-300 hover:border-brand-500/30 hover:shadow-layered">
                    <div className="text-xs font-bold tracking-[0.15em] uppercase text-ink-500 mb-2">
                      {plan.tagline}
                    </div>
                    <h2 className="text-2xl font-black font-display text-ink-950 mb-3">
                      {plan.name}
                    </h2>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black font-display text-ink-950">
                        {plan.price}
                      </span>
                      <span className="text-sm text-ink-500">{plan.period}</span>
                    </div>
                    <p className="text-sm text-ink-600 leading-relaxed mb-6">
                      {plan.desc}
                    </p>

                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-ink-600">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* mt-auto pins every CTA to a shared baseline regardless of
                        how many features each plan lists.

                        All three carry the brand fill. Equal weight had to mean
                        equally strong, not equally faint: the quiet outline
                        style the two unfeatured cards used would otherwise have
                        left this page's primary action as three ghost buttons.

                        `text-on-brand`, not the `text-white` the featured card
                        used — the brand ramp turns yellow in dark mode, where
                        white type on it fails contrast outright. */}
                    <Tactile
                      href={plan.href}
                      rippleColor="rgba(255,255,255,0.45)"
                      className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 font-semibold text-sm rounded-2xl overflow-hidden bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand shadow-layered-brand transition-shadow duration-200"
                    >
                      {plan.cta} <ArrowRight className="w-4 h-4" />
                    </Tactile>
                  </div>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Rate card — individual services */}
      <section className="py-16 bg-canvas border-t border-ink-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal choreography="rise" className="text-center mb-12">
            <h2 className="text-2xl font-black font-display text-ink-950 mb-2">
              Individual services
            </h2>
            <p className="text-ink-600 text-sm max-w-lg mx-auto text-pretty">
              Not every project needs a full package. These are the rates for single
              components, billed on their own.
            </p>
          </Reveal>

          <div className="space-y-12">
            {rateCard.map((section) => (
              <Reveal key={section.group} choreography="rise">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-brand-500">
                    {section.group}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-brand-500/35 to-transparent" />
                </div>
                {section.note && (
                  <p className="text-xs text-ink-500 mb-3 text-pretty">{section.note}</p>
                )}
                <dl className="divide-y divide-ink-200/60">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-baseline justify-between gap-3 py-3"
                    >
                      <dt className="min-w-0 text-sm text-ink-700">{item.name}</dt>
                      {/* Dotted leader, the way a printed rate card ties each
                          label to its figure. Without it the eye has to cross a
                          wide gap and starts mis-pairing rows.

                          Dropped below `sm`. Measured at 390px, the longest row
                          ("Statement of purpose (postgraduate)") left just 19px
                          for the leader — that reads as a stray dash, not a
                          rule, and it was competing for the width the label
                          needs in order to wrap on a 360px phone.
                          `justify-between` holds label and figure to opposite
                          edges once the leader is gone. */}
                      <span
                        aria-hidden="true"
                        className="hidden sm:block flex-1 self-end mb-1 border-b border-dotted border-ink-300/70"
                      />
                      <dd className="text-sm font-bold font-display text-ink-950 whitespace-nowrap">
                        {item.price}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
          </div>

          {/* Included as standard */}
          <Reveal choreography="rise">
            <div className="mt-16 rounded-3xl bg-gradient-to-br from-brand-50 to-surface border border-brand-500/20 p-8">
              <h3 className="text-lg font-black font-display text-ink-950 mb-1.5">
                Included with every order
              </h3>
              <p className="text-sm text-ink-600 mb-6 text-pretty">
                No line items for the things that should never have been line items.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-ink-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal choreography="rise">
            <h2 className="text-2xl font-black font-display text-ink-950 text-center mb-10">
              Pricing FAQs
            </h2>
          </Reveal>
          {/* Alternating slide direction gives the list a reading rhythm
              instead of six identical fade-ups. */}
          <Stagger each={stagger.base} className="space-y-4">
            {faq.map((item, i) => (
              <StaggerItem
                key={item.q}
                choreography={i % 2 === 0 ? "slideRight" : "slideLeft"}
              >
                <div className="bg-canvas border border-ink-200/60 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-ink-950 text-sm mb-2">{item.q}</div>
                      <div className="text-sm text-ink-600 leading-relaxed text-pretty">{item.a}</div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-canvas border-t border-ink-200/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal choreography="rise">
            <h2 className="text-2xl font-black font-display text-ink-950 mb-3">
              Need a custom quote?
            </h2>
            <p className="text-ink-600 mb-6 text-pretty">
              Every project is unique. Book a free consultation and we&apos;ll create a
              tailored quote for your specific needs.
            </p>
            <Tactile
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-on-brand font-semibold text-sm rounded-xl shadow-layered-brand overflow-hidden"
            >
              Get Custom Quote <ArrowRight className="w-4 h-4" />
            </Tactile>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
