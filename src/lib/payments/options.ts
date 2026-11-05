import { z } from "zod";

/**
 * Shared payment vocabulary.
 * ----------------------------------------------------------------------------
 * Imported by both the client form and the API route, so that the rules the
 * form enforces and the rules the server enforces are literally the same
 * object. A client-side-only validation is a suggestion, not a constraint —
 * the server re-validates everything here on every request.
 *
 * No `server-only` marker: this file holds no secrets.
 */

/* -------------------------------------------------------------------------- */
/*  Limits                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Bounds on a single payment, in whole naira.
 *
 * The floor exists because Paystack's fee makes a ₦50 payment cost more to
 * collect than it collects, and because a mistyped amount is far more often
 * too small than too large. The ceiling is a typo guard: the largest published
 * figure on the rate card is ₦290,000, so a ₦20,000,000 payment is an extra
 * keystroke rather than a customer.
 *
 * Neither is a business rule about what the consultancy may charge — a genuine
 * payment above the ceiling is taken by bank transfer, which is offered
 * alongside the gateway.
 */
export const MIN_AMOUNT_NAIRA = 1_000;
export const MAX_AMOUNT_NAIRA = 5_000_000;

/* -------------------------------------------------------------------------- */
/*  Instalments                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The published payment terms, verbatim from /pricing: "50% to begin, 30% at
 * draft delivery, and 20% on final delivery."
 *
 * These are labels, not calculations. The site never computes an instalment,
 * because it does not know the quoted total — the consultant issues a written
 * quote first, and the client enters the figure they were given. Inventing a
 * percentage of a price the customer has not agreed to would be worse than
 * asking them to type it.
 */
export const MILESTONES = [
  {
    value: "deposit",
    label: "Deposit — 50% to begin",
    hint: "The opening instalment that starts the work.",
  },
  {
    value: "draft",
    label: "Draft stage — 30%",
    hint: "Due when your draft is delivered.",
  },
  {
    value: "final",
    label: "Final stage — 20%",
    hint: "Due on final delivery.",
  },
  {
    value: "full",
    label: "Full payment",
    hint: "Settling the whole quoted amount in one go.",
  },
  {
    value: "part",
    label: "Part payment / other",
    hint: "Any other amount agreed with your consultant.",
  },
] as const;

export type MilestoneValue = (typeof MILESTONES)[number]["value"];

const MILESTONE_VALUES = MILESTONES.map((m) => m.value) as [
  MilestoneValue,
  ...MilestoneValue[],
];

/** Human label for a stored milestone value, for receipts and the admin list. */
export function milestoneLabel(value: string): string {
  return MILESTONES.find((m) => m.value === value)?.label ?? "Payment";
}

/* -------------------------------------------------------------------------- */
/*  Services                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * What the payment is for. Kept in step with the booking form's list so a
 * client who booked "Data Analysis (SPSS/R)" can pay against the same label,
 * which is what makes the two records reconcilable by hand.
 */
export const PAYABLE_SERVICES = [
  "Project Writing",
  "Project Editing & Proofreading",
  "Research Assistance",
  "Data Analysis (SPSS/R)",
  "Study Abroad Consultancy",
  "Admission Guidance",
  "Scholarship Guidance",
  "CV & Statement of Purpose",
  "Business Proposal",
  "Journal Formatting",
  "Assignment Assistance",
  "General Academic Consultation",
  "Other",
] as const;

/* -------------------------------------------------------------------------- */
/*  Schema                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The amount.
 *
 * Accepts a string as well as a number because the form field is a text input
 * — see the comment on that input in `PaymentForm` for why it is not
 * `type="number"` — and because a hand-written API call may legitimately send
 * a JSON number.
 *
 * Thousands separators and a naira sign are stripped before parsing. A
 * Nigerian customer paying ₦110,000 types "110,000", and `Number("110,000")`
 * is `NaN`; rejecting that as "invalid amount" would be a self-inflicted
 * drop-off at the very last step of the funnel.
 *
 * Every check lives in one `transform` rather than a chain of `refine`s so
 * that the first failure wins and the customer sees one precise message
 * instead of "invalid" stacked on "too small".
 */
const amountNaira = z.union([z.string(), z.number()]).transform((value, ctx) => {
  const reject = (message: string) => {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    return z.NEVER;
  };

  const cleaned =
    typeof value === "string" ? value.replace(/[\s,₦]/g, "").trim() : value;

  if (cleaned === "") {
    return reject("Enter the amount you were quoted");
  }

  const naira = Number(cleaned);

  if (!Number.isFinite(naira)) {
    return reject("Enter the amount in figures, e.g. 110000");
  }

  if (naira < MIN_AMOUNT_NAIRA) {
    return reject(
      `Minimum online payment is ₦${MIN_AMOUNT_NAIRA.toLocaleString("en-NG")}`,
    );
  }

  if (naira > MAX_AMOUNT_NAIRA) {
    return reject(
      `For amounts above ₦${MAX_AMOUNT_NAIRA.toLocaleString("en-NG")}, please pay by bank transfer`,
    );
  }

  // Kobo is the smallest unit there is; a third decimal cannot be charged.
  if (Math.abs(naira * 100 - Math.round(naira * 100)) > 1e-6) {
    return reject("Amounts can have at most two decimal places");
  }

  return naira;
});

export const paymentRequestSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(255),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(255),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(50)
    .optional()
    .or(z.literal("")),
  service: z.string().trim().min(1, "Select what this payment is for").max(255),
  milestone: z.enum(MILESTONE_VALUES),
  amount: amountNaira,
  quoteRef: z.string().trim().max(100).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Links the payment to a consultation booked through /book. */
  bookingId: z.string().uuid().optional().or(z.literal("")),
});

/**
 * The schema has a transform in it, so its input and output types differ:
 * `amount` arrives as a string from the form and leaves as a number.
 *
 * Both are exported because react-hook-form needs them separately — the field
 * types it registers are the INPUT shape, while the handler it calls after
 * validation receives the OUTPUT shape. Collapsing them into one `z.infer`
 * is what makes the resolver fail to typecheck.
 */
export type PaymentRequestInput = z.input<typeof paymentRequestSchema>;
export type PaymentRequest = z.output<typeof paymentRequestSchema>;

/** The shape `/api/payments/initialize` answers with on success. */
export type InitializeResponse = {
  reference: string;
  authorizationUrl: string;
};
