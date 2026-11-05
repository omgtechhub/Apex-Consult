"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Lock, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { FieldError, SubmitError, SubmitLabel } from "@/components/motion/FormMotion";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { spring } from "@/lib/motion";
import {
  MAX_AMOUNT_NAIRA,
  MILESTONES,
  MIN_AMOUNT_NAIRA,
  PAYABLE_SERVICES,
  paymentRequestSchema,
  type PaymentRequest,
  type PaymentRequestInput,
} from "@/lib/payments/options";

/** Shared input styling — matches /contact and /book field for field. */
const fieldBase =
  "w-full px-4 py-3 bg-canvas border rounded-xl text-sm text-ink-950 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-[border-color,box-shadow,background-color] duration-200";

/**
 * Paystack checkout form.
 * ----------------------------------------------------------------------------
 * Deliberately a *redirect* integration rather than Paystack's inline popup.
 *
 *   - The popup is an iframe that needs a third-party script on every page
 *     load; the redirect needs nothing, which keeps the whole marketing site's
 *     JavaScript budget unchanged.
 *   - Mobile browsers routinely block or mis-size payment iframes, and this
 *     site's traffic is overwhelmingly mobile.
 *   - Bank apps opened for 3-D Secure cannot return into an iframe, so the
 *     popup silently strands exactly the customers most likely to pay by
 *     transfer.
 *
 * The amount is typed by the customer because the consultancy quotes before it
 * charges: /pricing publishes starting prices and 50/30/20 instalment terms,
 * and the consultant issues a written quote. The server re-validates the
 * amount against the same schema this form uses, and bounds it, so a hand-
 * crafted request cannot charge an arbitrary figure either way.
 */
export function PaymentForm({
  /** Pre-selects a service when arriving from a service page or a booking. */
  defaultService,
  /** Links the payment to a consultation booked through /book. */
  bookingId,
  /** True when the gateway is running on test keys. */
  testMode,
  /**
   * True when Paystack bounced the customer back via its "cancel" link, which
   * returns to /pay?cancelled=1.
   *
   * Passed down from the page, which already reads `searchParams` on the
   * server, rather than read here from `window.location` in an effect. Reading
   * it in an effect would mean setting state after the first paint — the
   * notice would flash in a frame late — and reading it in a `useState`
   * initialiser would dereference `window` during server rendering.
   */
  cancelled,
}: {
  defaultService?: string;
  bookingId?: string;
  testMode?: boolean;
  cancelled?: boolean;
}) {
  const prefersReduced = useReducedMotion() ?? false;

  /**
   * `isRedirecting` is separate from react-hook-form's `isSubmitting`.
   *
   * `isSubmitting` goes false the moment the fetch resolves, but at that point
   * the browser is still navigating to Paystack. Releasing the button there
   * would let an impatient customer press it again and open a second
   * transaction for the same invoice.
   */
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * The cancellation notice is dismissed by starting another payment, not by
   * rewriting the URL. Derived state rather than stored state: there is one
   * source of truth (the query string) and one override (this flag).
   */
  const [cancelDismissed, setCancelDismissed] = useState(false);
  const wasCancelled = !!cancelled && !cancelDismissed;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
    // Three generics, because the schema transforms: the form's fields hold
    // the INPUT shape (amount as a typed string) while `onSubmit` receives the
    // validated OUTPUT shape (amount as a number).
  } = useForm<PaymentRequestInput, unknown, PaymentRequest>({
    resolver: zodResolver(paymentRequestSchema),
    defaultValues: {
      service: defaultService ?? "",
      milestone: "deposit",
      bookingId: bookingId ?? "",
    },
  });

  // `useWatch` rather than the `watch()` returned by `useForm`: `watch` hands
  // back a fresh function on every render, which the React Compiler cannot
  // memoize, so it bails out of optimising this whole component. `useWatch`
  // subscribes to the one field and re-renders only when it changes.
  const selectedMilestone = useWatch({ control, name: "milestone" });
  const milestoneHint = MILESTONES.find((m) => m.value === selectedMilestone)?.hint;

  const onSubmit = async (data: PaymentRequest) => {
    setSubmitError(null);
    setCancelDismissed(true);

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = (await res.json().catch(() => null)) as
        | {
            authorizationUrl?: string;
            error?: string;
            fieldErrors?: Record<string, string>;
          }
        | null;

      if (!res.ok || !payload?.authorizationUrl) {
        // Server-side field errors are attached to their inputs rather than
        // summarised, so the customer can see which value to change.
        if (payload?.fieldErrors) {
          for (const [field, message] of Object.entries(payload.fieldErrors)) {
            setError(field as keyof PaymentRequestInput, {
              type: "server",
              message,
            });
          }
        }

        setSubmitError(
          payload?.error ?? "We could not start this payment. Please try again.",
        );
        return;
      }

      // Hold the button disabled across the navigation — see `isRedirecting`.
      setIsRedirecting(true);

      // `assign`, not `replace`: the browser Back button should bring the
      // customer back to this form if they change their mind at checkout.
      window.location.assign(payload.authorizationUrl);
    } catch {
      setSubmitError(
        "We could not reach the payment service. Check your connection and try again.",
      );
    }
  };

  const busy = isSubmitting || isRedirecting;

  return (
    <div className="bg-surface border border-ink-200/60 rounded-3xl p-6 sm:p-8 lg:p-10">
      {testMode && (
        <div
          role="status"
          className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Test mode.</strong> This gateway is
            running on Paystack test keys, so no real money will move.
          </span>
        </div>
      )}

      <Stagger className="space-y-5" each={0.05}>
        <StaggerItem choreography="fade">
          <h2 className="text-xl font-black font-display text-ink-950">
            Payment details
          </h2>
          <p className="mt-1.5 text-sm text-ink-600">
            Enter the amount from your written quote. You will be taken to
            Paystack to pay by card, bank transfer, USSD or mobile money.
          </p>
        </StaggerItem>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <SubmitError show={wasCancelled}>
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              That payment was cancelled and nothing was charged. You can start
              again below.
            </span>
          </SubmitError>

          <SubmitError show={!!submitError}>
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              {submitError}{" "}
              <a
                href="https://wa.me/2347084321204?text=Hello!%20I%20had%20trouble%20paying%20online."
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                Pay by transfer instead
              </a>
              .
            </span>
          </SubmitError>

          {/* Who is paying */}
          <StaggerItem choreography="rise" className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="pay-name"
                className="mb-1.5 block text-xs font-semibold text-ink-700"
              >
                Full name *
              </label>
              <input
                id="pay-name"
                {...register("name")}
                autoComplete="name"
                aria-invalid={!!errors.name}
                className={cn(
                  fieldBase,
                  errors.name ? "border-red-300" : "border-ink-200",
                )}
                placeholder="Your full name"
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <label
                htmlFor="pay-email"
                className="mb-1.5 block text-xs font-semibold text-ink-700"
              >
                Email *
              </label>
              <input
                id="pay-email"
                {...register("email")}
                type="email"
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!errors.email}
                aria-describedby="pay-email-hint"
                className={cn(
                  fieldBase,
                  errors.email ? "border-red-300" : "border-ink-200",
                )}
                placeholder="your@email.com"
              />
              <FieldError message={errors.email?.message} />
              <p id="pay-email-hint" className="mt-1.5 text-xs text-ink-500">
                Your receipt goes here.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem choreography="rise" className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="pay-phone"
                className="mb-1.5 block text-xs font-semibold text-ink-700"
              >
                Phone / WhatsApp
              </label>
              <input
                id="pay-phone"
                {...register("phone")}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={!!errors.phone}
                className={cn(
                  fieldBase,
                  errors.phone ? "border-red-300" : "border-ink-200",
                )}
                placeholder="+234 xxx xxx xxxx"
              />
              <FieldError message={errors.phone?.message} />
            </div>

            <div>
              <label
                htmlFor="pay-service"
                className="mb-1.5 block text-xs font-semibold text-ink-700"
              >
                What is this payment for? *
              </label>
              <select
                id="pay-service"
                {...register("service")}
                aria-invalid={!!errors.service}
                className={cn(
                  fieldBase,
                  errors.service ? "border-red-300" : "border-ink-200",
                )}
              >
                <option value="">Select a service</option>
                {PAYABLE_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <FieldError message={errors.service?.message} />
            </div>
          </StaggerItem>

          {/* What is being paid */}
          <StaggerItem choreography="rise" className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="pay-milestone"
                className="mb-1.5 block text-xs font-semibold text-ink-700"
              >
                Instalment *
              </label>
              <select
                id="pay-milestone"
                {...register("milestone")}
                aria-invalid={!!errors.milestone}
                aria-describedby="pay-milestone-hint"
                className={cn(
                  fieldBase,
                  errors.milestone ? "border-red-300" : "border-ink-200",
                )}
              >
                {MILESTONES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {/* The hint changes with the selection, so it is announced. */}
              <p
                id="pay-milestone-hint"
                aria-live="polite"
                className="mt-1.5 text-xs text-ink-500"
              >
                {milestoneHint}
              </p>
            </div>

            <div>
              <label
                htmlFor="pay-amount"
                className="mb-1.5 block text-xs font-semibold text-ink-700"
              >
                Amount (₦) *
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-500"
                >
                  ₦
                </span>
                <input
                  id="pay-amount"
                  {...register("amount")}
                  type="text"
                  // `text` with a numeric keypad rather than `type="number"`:
                  // number inputs reject the thousands separators Nigerian
                  // customers type ("110,000") and silently change value on an
                  // accidental scroll wheel over the field.
                  inputMode="decimal"
                  autoComplete="off"
                  aria-invalid={!!errors.amount}
                  aria-describedby="pay-amount-hint"
                  className={cn(
                    fieldBase,
                    "pl-9 font-semibold tabular-nums",
                    errors.amount ? "border-red-300" : "border-ink-200",
                  )}
                  placeholder="110,000"
                />
              </div>
              <FieldError message={errors.amount?.message} />
              <p id="pay-amount-hint" className="mt-1.5 text-xs text-ink-500">
                As quoted by your consultant. ₦
                {MIN_AMOUNT_NAIRA.toLocaleString("en-NG")}–₦
                {MAX_AMOUNT_NAIRA.toLocaleString("en-NG")}.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem choreography="rise">
            <label
              htmlFor="pay-quote-ref"
              className="mb-1.5 block text-xs font-semibold text-ink-700"
            >
              Quote or project reference
            </label>
            <input
              id="pay-quote-ref"
              {...register("quoteRef")}
              aria-invalid={!!errors.quoteRef}
              className={cn(
                fieldBase,
                errors.quoteRef ? "border-red-300" : "border-ink-200",
              )}
              placeholder="From your quote — helps us match the payment faster"
            />
            <FieldError message={errors.quoteRef?.message} />
          </StaggerItem>

          <StaggerItem choreography="rise">
            <label
              htmlFor="pay-note"
              className="mb-1.5 block text-xs font-semibold text-ink-700"
            >
              Note for our team
            </label>
            <textarea
              id="pay-note"
              {...register("note")}
              rows={3}
              aria-invalid={!!errors.note}
              className={cn(
                fieldBase,
                "resize-none",
                errors.note ? "border-red-300" : "border-ink-200",
              )}
              placeholder="Anything we should know about this payment (optional)"
            />
            <FieldError message={errors.note?.message} />
          </StaggerItem>

          {/* `bookingId` travels with the form but is never shown — it comes
              from the booking confirmation link, not from the customer. */}
          <input type="hidden" {...register("bookingId")} />

          <StaggerItem choreography="rise">
            <motion.button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 py-3.5 text-sm font-semibold text-on-brand transition-shadow duration-200 hover:shadow-layered-brand disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={prefersReduced || busy ? undefined : { scale: 1.01, y: -1 }}
              whileTap={prefersReduced || busy ? undefined : { scale: 0.985 }}
              transition={spring.snappy}
            >
              <SubmitLabel
                pending={busy}
                busy={
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRedirecting ? "Opening Paystack…" : "Starting payment…"}
                  </>
                }
                idle={
                  <>
                    <Lock className="h-4 w-4" aria-hidden="true" /> Continue to
                    Paystack
                  </>
                }
              />
            </motion.button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-500">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              Payments are processed by Paystack. We never see or store your card
              details.
            </p>
          </StaggerItem>
        </form>
      </Stagger>
    </div>
  );
}
