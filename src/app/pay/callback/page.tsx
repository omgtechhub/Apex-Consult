import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { SuccessCheck } from "@/components/motion/FormMotion";
import { milestoneLabel } from "@/lib/payments/options";
import { formatNaira } from "@/lib/payments/paystack";
import { settlePayment, type SettlementOutcome } from "@/lib/payments/settle";

export const metadata: Metadata = {
  title: "Payment Status",
  robots: { index: false, follow: false },
};

/**
 * Where Paystack returns the customer after checkout.
 * ----------------------------------------------------------------------------
 * This page *verifies*; it does not trust. Paystack appends the reference to
 * the URL as `?reference=…&trxref=…`, and a URL is editable, so arriving here
 * proves nothing on its own. `settlePayment` re-asks the Paystack API what the
 * transaction actually is and renders that answer.
 *
 * It must never be cached or prerendered: the whole point is to report live
 * state for one specific transaction, and a cached receipt would show one
 * customer's result to the next.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** A gateway call on every request — `pg` and `fetch` both need Node. */
export const runtime = "nodejs";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas pt-28 lg:pt-36">
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-30" />
      <div className="relative mx-auto max-w-2xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <Reveal choreography="fade" duration={0.4}>
          <div className="rounded-3xl border border-ink-200/60 bg-surface p-8 text-center sm:p-10 lg:p-14">
            {children}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-xs font-medium text-ink-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

const whatsAppHelp =
  "https://wa.me/2347084321204?text=Hello!%20I%20need%20help%20with%20a%20payment.%20My%20reference%20is%20";

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;

  /**
   * Paystack sends both `reference` and `trxref`, historically identical.
   * `reference` is the documented one; `trxref` is read as a fallback so a
   * change at their end does not break the receipt.
   */
  const reference = (params.reference ?? params.trxref ?? "").trim();

  if (!reference) {
    return (
      <Shell>
        <HelpCircle className="mx-auto mb-5 h-14 w-14 text-ink-300" aria-hidden="true" />
        <h1 className="mb-3 text-2xl font-black font-display text-ink-950">
          No payment to show
        </h1>
        <p className="mx-auto mb-8 max-w-md text-pretty leading-relaxed text-ink-600">
          This page shows the result of a payment, and no payment reference came
          with the link. If you were paying just now, check your email for the
          Paystack receipt before trying again.
        </p>
        <Link
          href="/pay"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-3 text-sm font-semibold text-on-brand transition-shadow duration-200 hover:shadow-layered-brand"
        >
          Go to payments <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Shell>
    );
  }

  let outcome: SettlementOutcome;

  try {
    outcome = await settlePayment(reference);
  } catch (error) {
    // A database failure here must not render as "payment failed" — the money
    // may well have moved.
    console.error("[payments] callback settlement threw:", error);
    outcome = {
      state: "gateway-error",
      reference,
      message: "We could not confirm this payment just now.",
    };
  }

  /* ---------------------------------------------------------------- paid */
  if (outcome.state === "paid") {
    return (
      <Shell>
        <SuccessCheck className="mx-auto mb-6 h-20 w-20" />

        <h1 className="mb-3 text-2xl font-black font-display text-ink-950">
          Payment received
        </h1>
        <p className="mx-auto mb-8 max-w-md text-pretty leading-relaxed text-ink-600">
          Thank you{outcome.customerName ? `, ${outcome.customerName.split(" ")[0]}` : ""}.
          Your payment is confirmed and your consultant has been notified. A
          receipt is on its way to{" "}
          <span className="font-semibold text-ink-900">{outcome.customerEmail}</span>.
        </p>

        <dl className="mb-8 divide-y divide-ink-200/60 rounded-2xl border border-ink-200/60 bg-canvas px-6 py-2 text-left">
          <DetailRow label="Amount" value={formatNaira(outcome.amountSubunit)} />
          {outcome.service && <DetailRow label="For" value={outcome.service} />}
          <DetailRow label="Instalment" value={milestoneLabel(outcome.milestone)} />
          {outcome.channel && (
            <DetailRow label="Paid by" value={outcome.channel.replace(/_/g, " ")} />
          )}
          {outcome.paidAt && (
            <DetailRow
              label="Date"
              value={new Intl.DateTimeFormat("en-NG", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Africa/Lagos",
              }).format(outcome.paidAt)}
            />
          )}
          <DetailRow label="Reference" value={outcome.reference} />
        </dl>

        <p className="mb-6 text-sm text-ink-500">
          Keep your reference — quote it in any message about this payment.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-3 text-sm font-semibold text-on-brand transition-shadow duration-200 hover:shadow-layered-brand"
          >
            Back to home
          </Link>
          <a
            href={`${whatsAppHelp}${encodeURIComponent(outcome.reference)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors duration-200 ease-standard hover:border-brand-500/50 hover:text-brand-600"
          >
            Message your consultant
          </a>
        </div>
      </Shell>
    );
  }

  /* ------------------------------------------------------------- pending */
  if (outcome.state === "pending") {
    return (
      <Shell>
        <Clock className="mx-auto mb-5 h-14 w-14 text-amber-500" aria-hidden="true" />
        <h1 className="mb-3 text-2xl font-black font-display text-ink-950">
          Payment still processing
        </h1>
        <p className="mx-auto mb-8 max-w-md text-pretty leading-relaxed text-ink-600">
          Paystack has not finished confirming this one yet — bank transfers and
          USSD can take a few minutes. Reload this page shortly; nothing will be
          charged twice.
        </p>
        <dl className="mb-8 divide-y divide-ink-200/60 rounded-2xl border border-ink-200/60 bg-canvas px-6 py-2 text-left">
          <DetailRow label="Reference" value={outcome.reference} />
          {outcome.message && <DetailRow label="Status" value={outcome.message} />}
        </dl>
        {/*
          A plain link to the same URL, not a client component with a timer.
          Re-checking is an explicit choice, and a page that silently polls a
          payment gateway on the customer's data plan is not a kindness.
        */}
        <Link
          href={`/pay/callback?reference=${encodeURIComponent(outcome.reference)}`}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-3 text-sm font-semibold text-on-brand transition-shadow duration-200 hover:shadow-layered-brand"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Check again
        </Link>
      </Shell>
    );
  }

  /* -------------------------------------------------------- gateway error */
  if (outcome.state === "gateway-error") {
    return (
      <Shell>
        <AlertCircle
          className="mx-auto mb-5 h-14 w-14 text-amber-500"
          aria-hidden="true"
        />
        <h1 className="mb-3 text-2xl font-black font-display text-ink-950">
          We could not confirm this yet
        </h1>
        <p className="mx-auto mb-8 max-w-md text-pretty leading-relaxed text-ink-600">
          Your payment may well have gone through — we simply could not reach
          Paystack to check. <strong className="font-semibold">Do not pay again.</strong>{" "}
          Reload in a moment, or send us your reference and we will confirm it
          by hand.
        </p>
        <dl className="mb-8 divide-y divide-ink-200/60 rounded-2xl border border-ink-200/60 bg-canvas px-6 py-2 text-left">
          <DetailRow label="Reference" value={outcome.reference} />
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/pay/callback?reference=${encodeURIComponent(outcome.reference)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-3 text-sm font-semibold text-on-brand transition-shadow duration-200 hover:shadow-layered-brand"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Check again
          </Link>
          <a
            href={`${whatsAppHelp}${encodeURIComponent(outcome.reference)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors duration-200 ease-standard hover:border-brand-500/50 hover:text-brand-600"
          >
            Get help on WhatsApp
          </a>
        </div>
      </Shell>
    );
  }

  /* ----------------------------------------- failed / unknown reference */
  const unknown = outcome.state === "unknown-reference";

  return (
    <Shell>
      <XCircle className="mx-auto mb-5 h-14 w-14 text-red-500" aria-hidden="true" />
      <h1 className="mb-3 text-2xl font-black font-display text-ink-950">
        {unknown ? "We do not recognise that reference" : "Payment not completed"}
      </h1>
      <p className="mx-auto mb-8 max-w-md text-pretty leading-relaxed text-ink-600">
        {unknown ? (
          <>
            No payment on our records matches this reference. If you have just
            paid, check the Paystack email for the exact reference and send it to
            us — nothing has been charged from this page.
          </>
        ) : (
          <>
            This payment did not go through, so nothing was charged. Card
            declines are usually a daily online-transaction limit — your bank app
            can lift it, or you can pay by transfer or USSD instead.
          </>
        )}
      </p>

      <dl className="mb-8 divide-y divide-ink-200/60 rounded-2xl border border-ink-200/60 bg-canvas px-6 py-2 text-left">
        <DetailRow label="Reference" value={outcome.reference} />
        {!unknown && outcome.state === "failed" && outcome.message && (
          <DetailRow label="Reason given" value={outcome.message} />
        )}
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/pay"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-3 text-sm font-semibold text-on-brand transition-shadow duration-200 hover:shadow-layered-brand"
        >
          Try again <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a
          href={`${whatsAppHelp}${encodeURIComponent(outcome.reference)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors duration-200 ease-standard hover:border-brand-500/50 hover:text-brand-600"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Pay by transfer
        </a>
      </div>
    </Shell>
  );
}
