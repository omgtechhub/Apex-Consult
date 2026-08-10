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

export const metadata: Metadata = {
  title: "Pricing | Apex Academic Consultancy",
  description:
    "Transparent, affordable pricing for all academic services at Apex Academic Consultancy. No hidden fees.",
};

const plans = [
  {
    name: "Starter",
    tagline: "Perfect for simple tasks",
    price: "₦5,000",
    period: "per task",
    desc: "Great for assignments, short essays, proofreading, and quick edits.",
    features: [
      "Assignments (up to 2,000 words)",
      "Proofreading (up to 5,000 words)",
      "Short essays & reports",
      "Email delivery",
      "48-hour turnaround",
      "1 revision round",
    ],
    cta: "Get Started",
    href: "/book",
    highlight: false,
  },
  {
    name: "Professional",
    tagline: "Most popular choice",
    price: "₦20,000",
    period: "per project",
    desc: "Ideal for undergraduate and postgraduate projects, research assistance, and data analysis.",
    features: [
      "Full project writing (any length)",
      "Literature review & methodology",
      "Data analysis (SPSS/R/Python)",
      "Complete referencing",
      "7-14 day delivery",
      "Unlimited revisions",
      "Plagiarism report",
      "WhatsApp support",
    ],
    cta: "Book Now",
    href: "/book",
    highlight: true,
  },
  {
    name: "Premium",
    tagline: "For serious academic goals",
    price: "₦50,000",
    period: "per engagement",
    desc: "End-to-end PhD research, study abroad consultancy, and full professional packages.",
    features: [
      "PhD dissertation support",
      "Full study abroad package",
      "End-to-end research project",
      "Statistical analysis & interpretation",
      "Journal paper preparation",
      "Priority support",
      "Dedicated consultant",
      "Post-submission support",
    ],
    cta: "Book Consultation",
    href: "/book",
    highlight: false,
  },
];

const addons = [
  { name: "Plagiarism Report", price: "₦2,000" },
  { name: "Rush Delivery (24hrs)", price: "+50% of price" },
  { name: "Turnitin Report", price: "₦3,000" },
  { name: "PowerPoint Presentation", price: "₦5,000" },
  { name: "Journal Submission Support", price: "₦8,000" },
  { name: "Extra Revision Round", price: "₦3,000" },
];

const faq = [
  {
    q: "Are your prices negotiable?",
    a: "We offer competitive rates and can discuss pricing based on your specific project scope. Book a free consultation to get a custom quote.",
  },
  {
    q: "Do you offer payment installments?",
    a: "Yes! We offer flexible payment plans for larger projects. You can pay 50% upfront and the remaining 50% upon delivery.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfers, Flutterwave, Paystack, and mobile money. International clients can pay via Stripe.",
  },
  {
    q: "What if I'm not satisfied with the work?",
    a: "We offer unlimited revisions until you're completely satisfied. If we cannot meet your requirements, we offer a full refund.",
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-28 lg:pt-40 pb-16 lg:pb-20 bg-surface-dark relative overflow-hidden">
        <BackdropImage src="/images/library-desks.jpg" blurDataURL={blur["library-desks"]} tone="dark" parallax={0.08} priority />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-ink-400 mb-10">
            <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Pricing</span>
          </nav>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-gold-500 to-transparent" />
            <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">Pricing</span>
            <div className="w-8 h-px bg-gradient-to-l from-gold-500 to-transparent" />
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black font-display text-white leading-tight mb-5">
            <TextReveal text="Transparent pricing." />
            <br />
            <TextReveal
              text="No hidden fees. Ever."
              delay={0.12}
              mode="line"
              className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
            />
          </h1>
          <Reveal choreography="rise" delay={0.15}>
            <p className="text-lg text-ink-600 max-w-xl mx-auto mb-8 text-pretty">
              Premium academic support at fair prices. All plans include revisions and
              confidentiality guarantee.
            </p>
          </Reveal>
          <Reveal choreography="scale" delay={0.22}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-ink-600">
              <Zap className="w-3.5 h-3.5 text-gold-500" />
              Custom quotes available for complex projects
            </div>
          </Reveal>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* The featured plan reveals with `scale` while its neighbours rise,
              so the eye lands on it first without changing the visual design. */}
          <Stagger
            each={stagger.loose}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {plans.map((plan) => (
              <StaggerItem
                key={plan.name}
                choreography={plan.highlight ? "scale" : "rise"}
                className="h-full"
              >
                <Tilt max={plan.highlight ? 6 : 4} lift={plan.highlight ? 10 : 6} className="h-full rounded-3xl">
              <div
                className={`relative flex h-full flex-col rounded-3xl p-8 transition-[border-color,box-shadow] duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-br from-gold-50 to-white border-2 border-gold-500/50 shadow-layered-gold"
                    : "bg-canvas border border-ink-200/60 hover:border-gold-500/30 hover:shadow-layered"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div className={`text-xs font-bold tracking-[0.15em] uppercase mb-2 ${plan.highlight ? "text-gold-500" : "text-ink-500"}`}>
                  {plan.tagline}
                </div>
                <h2 className={`text-2xl font-black font-display mb-3 ${plan.highlight ? "text-ink-950" : "text-ink-950"}`}>
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-black font-display ${plan.highlight ? "text-gold-600" : "text-ink-950"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? "text-ink-500" : "text-ink-500"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${plan.highlight ? "text-ink-600" : "text-ink-600"}`}>
                  {plan.desc}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${plan.highlight ? "text-ink-600" : "text-ink-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* mt-auto pins every CTA to a shared baseline regardless of
                    how many features each plan lists. */}
                <Tactile
                  href={plan.href}
                  rippleColor={plan.highlight ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.28)"}
                  className={`mt-auto flex items-center justify-center gap-2 w-full py-3.5 font-semibold text-sm rounded-2xl overflow-hidden transition-shadow duration-200 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-layered-gold"
                      : "bg-surface border border-ink-300 text-ink-950 hover:border-gold-500/40 hover:bg-gold-50"
                  }`}
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

      {/* Add-ons */}
      <section className="py-16 bg-canvas border-t border-ink-200/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Reveal choreography="rise" className="text-center mb-10">
            <h2 className="text-2xl font-black font-display text-ink-950 mb-2">
              Add-ons &amp; Extras
            </h2>
            <p className="text-ink-600 text-sm">Customize your order with these additional services.</p>
          </Reveal>
          {/* Tight rhythm: these are small chips, so a slow cascade across six
              of them would read as sluggish rather than considered. */}
          <Stagger each={stagger.tight} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <StaggerItem key={addon.name} choreography="scale">
                <div className="bg-surface border border-ink-200/60 rounded-2xl p-5 transition-[border-color,box-shadow] duration-200 hover:border-gold-500/30 hover:shadow-layered">
                  <div className="font-semibold text-sm text-ink-950 mb-1">{addon.name}</div>
                  <div className="text-gold-500 font-bold text-lg font-display">{addon.price}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
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
                    <Star className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold text-sm rounded-xl shadow-layered-gold overflow-hidden"
            >
              Get Custom Quote <ArrowRight className="w-4 h-4" />
            </Tactile>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
