import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  CreditCard,
  Landmark,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { SoftBreak } from "@/components/ui/SoftBreak";
import { isLiveMode, isPaystackConfigured } from "@/lib/payments/paystack";

export const metadata: Metadata = {
  title: "Make a Payment",
  description:
    "Pay for your project, thesis or consultancy securely through Paystack — card, bank transfer, USSD or mobile money. Instalments of 50%, 30% and 20% are supported.",
  // A payment page has nothing to rank for and should not appear in results.
  robots: { index: false, follow: true },
};

/**
 * `/pay` — the single payment surface.
 *
 * The flow this page sits in, from /pricing: a client books a free
 * consultation, receives a written itemised quote, and then pays 50% to begin,
 * 30% at draft delivery and 20% on final delivery. So this page does not sell
 * anything and shows no prices; it collects a figure the client has already
 * been quoted. Putting a price list here would invite someone to pay for the
 * wrong scope.
 */

const channels = [
  { icon: CreditCard, label: "Card", detail: "Visa, Mastercard, Verve" },
  { icon: Landmark, label: "Bank transfer", detail: "Pay from your banking app" },
  { icon: Smartphone, label: "USSD", detail: "No internet banking needed" },
  { icon: Banknote, label: "Mobile money", detail: "Where your provider supports it" },
];

const assurances = [
  {
    icon: ShieldCheck,
    title: "Handled by Paystack",
    body: "Your card details go straight to Paystack and never touch our servers. Paystack is PCI-DSS compliant and licensed by the CBN.",
  },
  {
    icon: Receipt,
    title: "Receipt on the spot",
    body: "You get a confirmation page with your payment reference, and Paystack emails a receipt to the address you give.",
  },
  {
    icon: MessageCircle,
    title: "Prefer a transfer?",
    body: "Direct bank transfer is still available for any amount. Message us on WhatsApp and we will send the account details.",
  },
];

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; booking?: string; cancelled?: string }>;
}) {
  const params = await searchParams;

  // Both come from our own links (a service page, a booking confirmation), not
  // from anything the customer types. They only pre-fill the form; the server
  // re-validates every field on submit, so a tampered query string gains
  // nothing.
  const defaultService = params.service ?? "";
  const bookingId = params.booking ?? "";

  const configured = isPaystackConfigured();

  return (
    <div className="min-h-screen bg-canvas">
      <PageHero image="study-group" className="pb-8 lg:pb-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Reveal choreography="fade" duration={0.4}>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-ink-400"
            >
              <Link
                href="/"
                className="transition-colors duration-200 ease-standard hover:text-brand-500"
              >
                Home
              </Link>
              <span>/</span>
              <span className="text-white">Make a Payment</span>
            </nav>
          </Reveal>
        </div>
      </PageHero>

      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-30" />

      <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Left column — reassurance, which is the whole job of a payment
              page's supporting copy. Nothing here competes with the form. */}
          <Stagger className="lg:col-span-2" each={0.08}>
            <StaggerItem choreography="blurRise">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px w-8 bg-gradient-to-r from-brand-500 to-transparent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
                  Secure Payment
                </span>
              </div>
            </StaggerItem>

            <StaggerItem choreography="fade">
              <h1 className="mb-5 text-balance text-[clamp(2rem,4vw,3.5rem)] font-black font-display leading-tight text-ink-950">
                Pay for
                <SoftBreak />
                <TextReveal
                  text="your project."
                  mode="line"
                  delay={0.12}
                  className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent"
                />
              </h1>
            </StaggerItem>

            <StaggerItem
              choreography="blurRise"
              as="p"
              className="mb-8 leading-relaxed text-ink-600"
            >
              Enter the amount from your written quote and pay in a few taps.
              Standard terms are 50% to begin, 30% at draft delivery and 20% on
              final delivery — pick the instalment you are paying and we will
              match it to your project.
            </StaggerItem>

            <StaggerItem choreography="fade">
              <div className="mb-8 rounded-2xl border border-ink-200/60 bg-surface p-6">
                <div className="mb-4 text-xs font-semibold text-ink-500">
                  Ways to pay
                </div>
                <Stagger className="space-y-3.5" each={0.06} delayChildren={0.1}>
                  {channels.map((channel) => (
                    <StaggerItem key={channel.label} choreography="slideRight">
                      <div className="group flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 transition-transform duration-300 ease-overshoot group-hover:scale-110">
                          <channel.icon
                            className="h-4.5 w-4.5 text-brand-500"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-ink-900">
                            {channel.label}
                          </div>
                          <div className="text-xs text-ink-500">{channel.detail}</div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </StaggerItem>

            <StaggerItem choreography="rise">
              <Stagger className="space-y-5" each={0.07}>
                {assurances.map((item) => (
                  <StaggerItem key={item.title} choreography="rise">
                    <div className="flex gap-3">
                      <item.icon
                        className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-brand-500"
                        aria-hidden="true"
                      />
                      <div>
                        <div className="text-sm font-semibold text-ink-900">
                          {item.title}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </StaggerItem>

            <StaggerItem choreography="scale">
              <div className="mt-8 rounded-2xl border border-ink-200/60 bg-surface p-6">
                <div className="mb-3 text-sm font-bold text-ink-950">
                  Not sure what to pay?
                </div>
                <p className="mb-4 text-sm leading-relaxed text-ink-600">
                  Every project is quoted in writing before any payment. If you
                  have not had a quote yet, book a free consultation first.
                </p>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition-colors duration-200 ease-standard hover:text-brand-700"
                >
                  Book a free consultation →
                </Link>
              </div>
            </StaggerItem>
          </Stagger>

          {/*
            Plain fade on the form, matching /contact and /book: this is the
            conversion path and it must be usable the instant it paints rather
            than settling into place under the customer's thumb.
          */}
          <Reveal choreography="fade" duration={0.4} className="lg:col-span-3">
            {configured ? (
              <PaymentForm
                defaultService={defaultService}
                bookingId={bookingId}
                testMode={!isLiveMode()}
                cancelled={!!params.cancelled}
              />
            ) : (
              /*
                The gateway has no keys yet. An honest, actionable message beats
                a form that collects a customer's details and then fails at the
                last step.
              */
              <div className="rounded-3xl border border-ink-200/60 bg-surface p-8 lg:p-10">
                <h2 className="text-xl font-black font-display text-ink-950">
                  Online payment is being set up
                </h2>
                <p className="mt-3 leading-relaxed text-ink-600">
                  Card and transfer payments through Paystack are not switched on
                  for this site yet. In the meantime we will send you our bank
                  details directly — message us and we will reply within minutes.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://wa.me/2347084321204?text=Hello!%20I%20would%20like%20to%20make%20a%20payment."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-all duration-200 ease-standard hover:bg-[#20ba5a] active:scale-[0.98]"
                  >
                    Pay by transfer via WhatsApp
                  </a>
                  <Link
                    href="/contact"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 py-3 text-sm font-semibold text-ink-800 transition-colors duration-200 ease-standard hover:border-brand-500/50 hover:text-brand-600"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
