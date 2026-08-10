import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/booking/BookingForm";
import { CheckCircle2, Clock, Star, Shield } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { TextReveal } from "@/components/motion/TextReveal";

export const metadata: Metadata = {
  title: "Book a Consultation | Apex Academic Consultancy",
  description:
    "Book your free 15-minute consultation with Apex Academic Consultancy experts. Get personalized guidance for your academic project, research, or study abroad needs.",
};

const benefits = [
  { icon: CheckCircle2, text: "Free 15-minute initial consultation" },
  { icon: Clock, text: "Response within 2 hours" },
  { icon: Star, text: "Matched with your subject specialist" },
  { icon: Shield, text: "100% confidential" },
];

export default function BookPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* The booking form's heading lives inside the two-column grid below, so
          this hero is intentionally compact — it carries the breadcrumb and the
          photographic band, and hands straight over to the form. */}
      <PageHero image="peer-review" className="pb-8 lg:pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal choreography="fade" duration={0.4}>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400">
              <Link href="/" className="hover:text-gold-500 transition-colors duration-200 ease-standard">Home</Link>
              <span>/</span>
              <span className="text-white">Book Consultation</span>
            </nav>
          </Reveal>
        </div>
      </PageHero>

      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left panel */}
          <Stagger className="lg:col-span-2" each={0.08}>
            <StaggerItem choreography="blurRise">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-gradient-to-r from-gold-500 to-transparent" />
                <span className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase">Book Now</span>
              </div>
            </StaggerItem>

            <StaggerItem choreography="fade">
              <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black font-display text-ink-950 leading-tight mb-5 text-balance">
                Let&apos;s talk
                <br />
                <TextReveal
                  text="about your goals."
                  mode="line"
                  delay={0.12}
                  className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 bg-clip-text text-transparent"
                />
              </h1>
            </StaggerItem>

            <StaggerItem choreography="blurRise" as="p" className="text-ink-600 leading-relaxed mb-8">
              Book a free consultation with our academic experts. Tell us what you need,
              and we&apos;ll create a customized plan to help you achieve excellence.
            </StaggerItem>

            {/* Benefits — each one ticks in, so the list reads as it builds */}
            <StaggerItem choreography="fade">
              <Stagger className="space-y-4 mb-10" each={0.07} delayChildren={0.1}>
                {benefits.map((benefit) => (
                  <StaggerItem key={benefit.text} choreography="slideRight">
                    <div className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-overshoot group-hover:scale-110">
                        <benefit.icon className="w-4.5 h-4.5 text-gold-500" />
                      </div>
                      <span className="text-sm text-ink-700 font-medium">{benefit.text}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </StaggerItem>

            {/* WhatsApp alternative */}
            <StaggerItem choreography="scale">
              <div className="bg-surface border border-ink-200/60 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <div className="font-bold text-ink-950 text-sm">Prefer WhatsApp?</div>
                    <div className="text-xs text-ink-500">We respond within minutes</div>
                  </div>
                </div>
                <a
                  href="https://wa.me/2347084321204?text=Hello!%20I%20want%20to%20book%20a%20consultation%20for%20academic%20help."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#20ba5a] active:scale-[0.98] transition-all duration-200 ease-standard"
                >
                  Chat on WhatsApp
                </a>
                <p className="text-center text-xs text-ink-500 mt-2">+234 708 432 1204</p>
              </div>
            </StaggerItem>

            {/* Testimonial */}
            <StaggerItem choreography="rise">
              <div className="mt-8 p-6 bg-surface rounded-2xl">
                <Stagger className="flex gap-1 mb-3" each={0.06} delayChildren={0.15}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StaggerItem key={i} choreography="scale" as="span">
                      <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                    </StaggerItem>
                  ))}
                </Stagger>
                <p className="text-ink-600 text-sm italic mb-4">
                  &ldquo;Booked a consultation on Monday, received my complete project draft
                  by Thursday. Exceptional speed and quality!&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-ink-950 text-xs font-bold">
                    KA
                  </div>
                  <div>
                    <div className="text-ink-950 text-xs font-semibold">Kemi Adeyemo</div>
                    <div className="text-ink-600 text-[10px]">BSc Student, OAU</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </Stagger>

          {/*
            Plain fade on the booking form, for the same reason as /contact:
            this is the conversion path, and it must be usable the instant it
            paints rather than settling into place under the user's cursor.
          */}
          <Reveal choreography="fade" duration={0.4} className="lg:col-span-3">
            <BookingForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
