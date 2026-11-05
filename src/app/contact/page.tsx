import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { TextReveal } from "@/components/motion/TextReveal";

import { SoftBreak } from "@/components/ui/SoftBreak";
export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Altivance Academic Consultancy. WhatsApp, email, or fill out our form. We respond within 2 hours.",
};

const contactInfo = [
  {
    icon: Phone,
    label: "WhatsApp & Phone",
    value: "+234 708 432 1204",
    href: "tel:+2347084321204",
    desc: "Call or WhatsApp us directly",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@altivance.com",
    href: "mailto:info@altivance.com",
    desc: "We reply within 4 hours",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nigeria (Worldwide Service)",
    href: "#",
    desc: "Serving clients globally",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon – Sat: 8AM – 10PM",
    href: "#",
    desc: "West Africa Time (WAT)",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-canvas min-h-screen">
      <PageHero image="reading-room" position="object-[center_35%]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Reveal choreography="fade" duration={0.4}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400 mb-10">
            <Link href="/" className="hover:text-brand-500 transition-colors duration-200 ease-standard">Home</Link>
            <span>/</span>
            <span className="text-white">Contact</span>
          </nav>
        </Reveal>

        {/* Header */}
        <Stagger className="max-w-2xl mb-16" each={0.09}>
          <StaggerItem choreography="blurRise">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-brand-500 to-transparent" />
              <span className="text-brand-500 text-xs font-bold tracking-[0.2em] uppercase">Get In Touch</span>
            </div>
          </StaggerItem>

          <StaggerItem choreography="fade">
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black font-display text-white leading-tight mb-5 text-balance">
              We&apos;re here to
              <SoftBreak />
              <TextReveal
                text="help you succeed."
                mode="line"
                delay={0.12}
                className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
              />
            </h1>
          </StaggerItem>

          <StaggerItem choreography="blurRise" as="p" className="text-ink-600 text-lg leading-relaxed">
            Whether you have a quick question or need a full consultation, we&apos;re
            just a message away. Our team responds within 2 hours on business days.
          </StaggerItem>
        </Stagger>
        </div>
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left - Contact info */}
          <Stagger className="lg:col-span-2 space-y-6" each={0.07}>
            {contactInfo.map((info) => (
              <StaggerItem key={info.label} choreography="slideRight">
                <a
                  href={info.href}
                  className="flex items-start gap-4 p-5 bg-surface border border-ink-200/60 rounded-2xl hover:border-brand-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-standard group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0 group-hover:from-brand-400 group-hover:to-brand-500 transition-all duration-300 ease-standard group-hover:scale-110">
                    <info.icon className="w-5 h-5 text-brand-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink-500 mb-0.5">{info.label}</div>
                    <div className="font-bold text-ink-950 text-sm group-hover:text-brand-500 transition-colors duration-200 ease-standard">
                      {info.value}
                    </div>
                    <div className="text-xs text-ink-400 mt-0.5">{info.desc}</div>
                  </div>
                </a>
              </StaggerItem>
            ))}

            {/* WhatsApp CTA */}
            <StaggerItem choreography="slideRight">
              <a
                href="https://wa.me/2347084321204?text=Hello%20Altivance%20Academic%20Consultancy!%20I%20need%20help%20with%20my%20academic%20work."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-5 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl hover:bg-[#25D366]/15 hover:-translate-y-0.5 transition-all duration-300 ease-standard group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300 ease-overshoot group-hover:scale-110">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-ink-950 text-sm">Chat on WhatsApp Now</div>
                  <div className="text-xs text-ink-600">Fastest response — usually within minutes</div>
                </div>
              </a>
            </StaggerItem>

            {/* Map card */}
            <StaggerItem choreography="scale">
              <div className="bg-surface rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-brand-500 text-xs font-bold tracking-wider mb-3">
                    SERVING CLIENTS WORLDWIDE
                  </div>
                  <div className="text-ink-950 font-bold mb-2">Nigeria HQ · Global Reach</div>
                  <p className="text-ink-600 text-xs leading-relaxed">
                    Though based in Nigeria, we serve students and professionals across
                    Africa, the UK, USA, Canada, and beyond via online consultations.
                  </p>
                </div>
              </div>
            </StaggerItem>
          </Stagger>

          {/*
            The form gets a plain fade, deliberately.

            This is the page's conversion path and it sits above the fold on
            desktop. Travel or blur on a form means the primary action is
            visibly settling while the user is already reaching for the first
            field — motion getting in the way of the thing it should be
            supporting. A short opacity change keeps it present immediately.
          */}
          <Reveal choreography="fade" duration={0.4} className="lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
